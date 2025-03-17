from flask import Flask, logging, request, jsonify
from flask_sqlalchemy import SQLAlchemy


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
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


@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'Message': 'All fields are required'}), 400

    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({'Message': 'Username already exists'}), 409
    
    existing_email = User.query.filter_by(email=email).first()
    if existing_email:
        return jsonify({'Message': 'Email already exists'}), 409

    new_user = User(username=username, email=email, password=password)
    db.session.add(new_user)
    db.session.commit()

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

    return jsonify({'Message': 'Login successful'}), 200

@app.route('/userdetails', methods=['GET'])
def userdetails():
    data = request.get_json()
    username = data.get('username')
    name = data.get('name')
    age = data.get('age')
    userType = data.get('userType')

    if not username or not name or not age or not userType:
        return jsonify({'error': 'All fields are required'}), 400
    
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    user.name = name
    user.age = age
    user.userType = userType

    db.session.commit()
    return jsonify({'message': 'User details updated successfully'}), 200

'''
@app.route('/SetPasscode', methods=['POST'])
def SetPasscode():
    data = request.get_json()
    username = data.get('username')
    passcode = data.get('passcode')
    
    if not username or not passcode:
        return jsonify({'error': 'Missing username or passcode'}), 400
    
    if len(passcode) != 6 or not passcode.isdigit():
        return jsonify({'error': 'Passcode must be 6 digits'}), 400
    
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Update passcode
    user.passcode = passcode
    db.session.commit()

    return jsonify({'message': 'Passcode set successfully'}), 201

'''
 

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        app.run(host='0.0.0.0', port=5000, debug=True)
    #app.run(debug=True)
