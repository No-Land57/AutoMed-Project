from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_session import Session
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
import os
#TODO UNCOMMENT
#import RPi.GPIO as GPIO
import time
import atexit

#pi camera stuff below
import cv2
import face_recognition
from picamera2 import Picamera2
import numpy as np

#TODO UNCOMMENT
'''
IN3 = 25
IN4 = 8
ENB = 7


GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM)
GPIO.setup(IN3, GPIO.OUT)
GPIO.setup(IN4, GPIO.OUT)
GPIO.setup(ENB, GPIO.OUT)

pwm = GPIO.PWM(ENB, 1000)
pwm.start(0)

def unlock():
    GPIO.output(IN3, GPIO.HIGH)
    GPIO.output(IN4, GPIO.LOW)
    pwm.ChangeDutyCycle(100)

def lock():
    GPIO.output(IN3, GPIO.LOW)
    GPIO.output(IN4, GPIO.LOW)
    pwm.ChangeDutyCycle(0)

def cleanup_gpio():
    pwm.stop()
    GPIO.cleanup()

atexit.register(cleanup_gpio)
'''

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'secret_key'
app.config['SESSION_TYPE'] = 'filesystem'

Session(app)
CORS(app, supports_credentials=True)

UPLOAD_FOLDER = 'static/images'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

db = SQLAlchemy(app)
last_unlock_time = 0

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

    image1_path = db.Column(db.String(255))
    image2_path = db.Column(db.String(255))
    image3_path = db.Column(db.String(255))

class Prescription(db.Model):
    __tablename__ = 'prescriptions'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(24), db.ForeignKey('user.username'), nullable=False) #links to the user
    slot = db.Column(db.Integer) #slot number for the prescription
    drug = db.Column(db.String(120))
    dose = db.Column(db.Integer)
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

    # Store username in Flask session
    session['username'] = username

    return jsonify({'Message': 'Login successful'}), 200

@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'Message': 'Logged out successfully'}), 200

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
            'name': user.name if user.name else "",
            'age': user.age if user.age else "",
            'userType': user.userType if user.userType else ""
        }), 200
    
@app.route('/SetFaceID', methods = ['POST'])
def SetFaceID():
    if 'username' not in session:
        return jsonify({'Message': 'Authentication required'}), 403

    user = User.query.filter_by(username=session['username']).first()
    if not user:
        return jsonify({'Message': 'User not found'}), 404

    if not all(k in request.files for k in ['image1', 'image2', 'image3']):
        return jsonify({'Message': 'All three images are required'}), 400

    filenames = []
    for i in range(1, 4):
        file = request.files[f'image{i}']
        ext = file.filename.rsplit('.', 1)[-1]
        filename = secure_filename(f"{user.username}_image{i}.{ext}")
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        filenames.append(filepath.replace("\\", "/"))  # fix for Windows paths

    user.image1_path, user.image2_path, user.image3_path = filenames
    db.session.commit()

    return jsonify({'Message': 'Images uploaded successfully'}), 200

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

#TODO UNCOMMENT LOCK AND UNLOCK FUNCTIONS
@app.route('/UnlockWithPasscode', methods=['POST'])
def UnlockWithPasscode():
    global last_unlock_time
    if time.time() - last_unlock_time < 3:
        return jsonify({'Message': 'Please wait before trying again'}), 429

    data = request.get_json()
    entered_passcode = data.get('entered_passcode')

    if not entered_passcode:
        return jsonify({'Message': 'Passcode required'}), 400

    user = User.query.filter_by(username=session['username']).first()
    if not user:
        return jsonify({'Message': 'User not found'}), 404

    if user.passcode != entered_passcode:
        return jsonify({'Message': 'Invalid passcode'}), 401
    '''
    unlock()
    time.sleep(5)
    lock()
    last_unlock_time = time.time()
    '''
    return jsonify({'Message': 'Unlocked successfully'}), 200

#TODO IMPLEMENT PROPERLY
@app.route('/UnlockWithFaceID', methods=['POST'])
def UnlockWithFaceID():
    global last_unlock_time

    if 'username' not in session:
        return jsonify({'Message': 'Authentication required'}), 403

    if time.time() - last_unlock_time < 3:
        return jsonify({'Message': 'Please wait before trying again'}), 429

    user = User.query.filter_by(username=session['username']).first()
    if not user:
        return jsonify({'Message': 'User not found'}), 404

    # Load user's saved face images
    known_encodings = []
    for img_path in [user.image1_path, user.image2_path, user.image3_path]:
        if img_path and os.path.exists(img_path):
            image = face_recognition.load_image_file(img_path)
            locations = face_recognition.face_locations(image)
            encodings = face_recognition.face_encodings(image, locations)
            if encodings:
                known_encodings.append(encodings[0])

    if not known_encodings:
        return jsonify({'Message': 'No face data found for this user'}), 400

    try:
        # Start PiCamera and capture one frame
        picam2 = Picamera2()
        picam2.start()
        time.sleep(1)  # warm-up
        frame = picam2.capture_array()
        picam2.stop()

        # Convert to RGB and detect faces
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        live_locations = face_recognition.face_locations(rgb_frame)
        live_encodings = face_recognition.face_encodings(rgb_frame, live_locations)

        for live_face in live_encodings:
            results = face_recognition.compare_faces(known_encodings, live_face)
            distances = face_recognition.face_distance(known_encodings, live_face)
            best_match_index = np.argmin(distances)

            if results[best_match_index]:
                # ✅ UNLOCK LOGIC GOES HERE
                # unlock()
                # time.sleep(5)
                # lock()
                last_unlock_time = time.time()
                return jsonify({'Message': 'Unlocked successfully with FaceID'}), 200

        return jsonify({'Message': 'Face not recognized'}), 401

    except Exception as e:
        print("[ERROR] FaceID matching failed:", e)
        return jsonify({'Message': 'Internal server error'}), 500

@app.route('/SetSched', methods=['POST'])
def SetSched():
    if 'username' not in session:
        return jsonify({'Message': 'Authentication required'}), 403

    prescriptions = request.get_json().get('prescriptions', [])
    if not prescriptions:
        return jsonify({'Message': 'No prescriptions provided'}), 400

    has_valid = False

    for i, pres in enumerate(prescriptions):
        filled = (
            bool(pres.get('drug')) and
            bool(pres.get('dose')) and
            bool(pres.get('time')) and
            isinstance(pres.get('selectedDays'), list) and len(pres.get('selectedDays')) > 0
        )

        empty = (
            not pres.get('drug') and
            not pres.get('dose') and
            not pres.get('time') and
            (not isinstance(pres.get('selectedDays'), list) or len(pres.get('selectedDays')) == 0)
        )

        existing = Prescription.query.filter_by(username=session['username'], slot=i).first()

        if filled:
            has_valid = True
            if existing:
                # Update existing prescription
                existing.drug = pres['drug']
                existing.dose = pres['dose']
                existing.time = pres['time']
                existing.selectedDays = ",".join(pres['selectedDays'])
            else:
                # Add new prescription
                new_prescription = Prescription(
                    username=session['username'],
                    slot=i,
                    drug=pres['drug'],
                    dose=pres['dose'],
                    time=pres['time'],
                    selectedDays=",".join(pres['selectedDays'])
                )
                db.session.add(new_prescription)

        elif empty and existing:
            # Delete prescription if current slot is cleared
            db.session.delete(existing)

        elif not filled and not empty:
            return jsonify({'Message': f'Prescription {i+1} is incomplete.'}), 400

    if not has_valid:
        return jsonify({'Message': 'Fill out at least one complete prescription.'}), 400

    db.session.commit()
    return jsonify({'Message': 'Prescriptions updated successfully'}), 201


@app.route('/GetSched', methods=['GET'])
def GetSched():
    if 'username' not in session:
        return jsonify({'Message': 'Authentication required'}), 403

    prescriptions = Prescription.query.filter_by(username=session['username']).order_by(Prescription.slot).all()
    if not prescriptions:
        return jsonify([]), 200  # return empty list instead of 404 to avoid breaking frontend

    schedule = []
    for pres in prescriptions:
        schedule.append({
            'slot': pres.slot,
            'drug': pres.drug,
            'dose': pres.dose,
            'time': pres.time,
            'selectedDays': pres.selectedDays.split(",")
        })

    return jsonify(schedule), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    
    is_main = os.environ.get('WERKZEUG_RUN_MAIN', 'true') == 'true'

    if is_main:
        print("Starting server...")
        app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)
    #app.run(debug=True)
