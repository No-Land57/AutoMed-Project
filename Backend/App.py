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
    email = db.Column(db.String(120), unique=True, nullable=False)
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
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'message': 'All fields are required'}), 400

    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({'message': 'Username already exists'}), 409
    
    existing_email = User.query.filter_by(email=email).first()
    if existing_email:
        return jsonify({'message': 'Email already exists'}), 409

    new_user = User(username=username, email=email, password=password)
    db.session.add(new_user)
    db.session.commit()

    session['username'] = username

    return jsonify({'message': 'User created successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Both username and password are required'}), 400

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'message': 'Invalid username'}), 401
    
    if user.password != password:
        return jsonify({'message': 'Invalid password'}), 401
    
    session['username'] = username

    return jsonify({'message': 'Login successful'}), 200

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
        return jsonify({'message': 'User details updated successfully'}), 200
    
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

    return jsonify({'message': 'Passcode set successfully'}), 201

@app.route('/SetSched', methods=['POST'])
def SetSched():
    if 'username' not in session:
        return jsonify({'message': 'Authentication required'}), 403

    prescriptions = request.get_json().get('prescriptions', [])
    if not prescriptions:
        return jsonify({'message': 'No prescriptions provided'}), 400

    for pres in prescriptions:
        if not all(pres.get(key) for key in ['drug', 'dose', 'time', 'selectedDays']):
            return jsonify({'message': 'Missing fields in prescription'}), 400

        new_prescription = Prescription(
            username=session['username'],
            drug=pres['drug'],
            dose=pres['dose'],
            time=pres['time'],
            selectedDays=",".join(pres['selectedDays'])  # Store as comma-separated string
        )
        db.session.add(new_prescription)

    db.session.commit()
    return jsonify({'message': 'Prescriptions updated successfully'}), 201

@app.route('/GetSched', methods=['GET'])
def GetSched():
    if 'username' not in session:
        return jsonify({'message': 'Authentication required'}), 403

    prescriptions = Prescription.query.filter_by(username=session['username']).all()
    if not prescriptions:
        return jsonify({'message': 'No prescriptions found'}), 404

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
