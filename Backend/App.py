from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_session import Session

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'secret_key'
app.config['SESSION_TYPE'] = 'filesystem'

Session(app)
CORS(app, supports_credentials=True)

db = SQLAlchemy(app)

class User(db.Model):
    #signup/login
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(24), unique=True, nullable=False)
    password = db.Column(db.String(128))
    #SetPasscode
    passcode = db.Column(db.String(6))
    #userdetails
    name = db.Column(db.String(120))
    age = db.Column(db.Integer)
    userType = db.Column(db.String(120))

class Prescription(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(24), db.ForeignKey('user.username'), nullable=False) #links to the user
    drug = db.Column(db.String(120))
    dose = db.Column(db.String(120),nullable=False)
    time = db.Column(db.String(120),nullable=False)
    selectedDays = db.Column(db.String(120),nullable=False)

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'Message': 'All fields are required'}), 400

    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({'Message': 'Username already exists'}), 409

    new_user = User(username=username, password=password)
    db.session.add(new_user)
    db.session.commit()

    session['username'] = username

    return jsonify({'Message': 'User created successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'Message': 'Both username and password are required'}), 400

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'Message': 'Invalid username'}), 401
    
    if user.password != password:
        return jsonify({'Message': 'Invalid password'}), 401
    
    session['username'] = username

    return jsonify({'Message': 'Login successful'}), 200

@app.route('/userdetails', methods=['GET', 'POST'])
def user_details():
    if 'username' not in session:
        return jsonify({'error': 'Authentication required'}), 403

    user = User.query.filter_by(username=session['username']).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if request.method == 'POST':
        data = request.get_json()
        user.name = data.get('name', user.name)
        user.age = data.get('age', user.age)
        user.userType = data.get('userType', user.userType)
        db.session.commit()
        return jsonify({'Message': 'User details updated successfully'}), 200
    
    elif request.method == 'GET':
        return jsonify({
            'name': user.name if user.name else "N/A",
            'age': user.age if user.age else "N/A",
            'userType': user.userType if user.userType else "N/A"
        }), 200

@app.route('/SetPasscode', methods=['POST'])
def SetPasscode():
    data = request.get_json()
    passcode = data.get('passcode')
    
    if len(passcode) != 6 or not passcode.isdigit():
        return jsonify({'error': 'Passcode must be 6 digits'}), 400
    
    username = session.get('username')
    if not username:
        return jsonify({'error': 'User not authenticated'}), 401
    
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Update passcode
    user.passcode = passcode
    db.session.commit()

    return jsonify({'Message': 'Passcode set successfully'}), 201

@app.route('UnlockWithPasscode')
def UnlockWithPasscode():
    if 'username' not in session:
     return jsonify({'Message': 'Authentication required'}), 403
    
    data = request.get_json()
    passcodeUnlock = data.get('passcode')

    # Check if the passcode is valid
    if passcodeUnlock != session.get('passcode'):
        return jsonify({'Message': 'Invalid passcode'}), 401
    

    # If valid, unlock the user
    user = User.query.filter_by(username=session['username']).first()
    if not user:
        return jsonify({'Message': 'User not found'}), 404
    


@app.route('/SetSched', methods=['POST'])
def SetSched():
    if 'username' not in session:
        return jsonify({'Message': 'Authentication required'}), 403

    prescriptions = request.get_json().get('prescriptions', [])
    if not prescriptions:
        return jsonify({'Message': 'No prescriptions provided'}), 400

    for pres in prescriptions:
        if not all(pres.get(key) for key in ['drug', 'dose', 'time', 'selectedDays']):
            return jsonify({'Message': 'Missing fields in prescription'}), 400

        print(f"Time: {pres['time']}")
        print(f"Selected Days: {','.join(pres['selectedDays'])}")

        new_prescription = Prescription(
            username=session['username'],
            drug=pres['drug'],
            dose=pres['dose'],
            time=pres['time'],
            selectedDays=",".join(pres['selectedDays'])  # Store as comma-separated string
      
        )
        db.session.add(new_prescription)

    db.session.commit()
    return jsonify({'Message': 'Prescriptions updated successfully'}), 201

@app.route('/GetSched', methods=['GET'])
def GetSched():
    if 'username' not in session:
        return jsonify({'Message': 'Authentication required'}), 403

    prescriptions = Prescription.query.filter_by(username=session['username']).all()
    if not prescriptions:
        return jsonify({'Message': 'No prescriptions found'}), 404

    schedule = []
    for pres in prescriptions:
        schedule.append({
            'drug': pres.drug,
            'dose': pres.dose,
            'time': pres.time,
            'selectedDays': pres.selectedDays.split(",")  # Convert back to list
        })

    return jsonify(schedule), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        app.run(host='0.0.0.0', port=5000, debug=True)
    #app.run(debug=True)
