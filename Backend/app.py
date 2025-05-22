from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_session import Session
from datetime import datetime
from werkzeug.utils import secure_filename
from picamera2 import Picamera2
from PIL import Image, ImageOps
from apscheduler.schedulers.background import BackgroundScheduler
from threading import Thread, Timer
from functools import partial
import RPi.GPIO as GPIO
import numpy as np
import os
import subprocess
import signal
import time
import atexit
import face_recognition
import cv2

IN3 = 25
IN4 = 8
ENB = 7

pwm = None

def init_actuator_gpio():
    global pwm
    GPIO.setwarnings(False)
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(IN3, GPIO.OUT)
    GPIO.setup(IN4, GPIO.OUT)
    GPIO.setup(ENB, GPIO.OUT)

    try:
        pwm.stop()
    except:
        pass

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
    global pwm
    try:
        if pwm:
            pwm.stop()
    except Exception as e:
        print(f"[WARN] PWM cleanup error: {e}")
    GPIO.cleanup()

def run_actuator_delayed(a, d, delay_sec):
    def dispatch():
        print(f"[DELAYED DISPENSE] Actuator {a} | Dose {d} | Delay: {delay_sec}s")
        subprocess.run(["python3", "fin_act.py", str(a), str(d)])
    
    Timer(delay_sec, dispatch).start()

def kill_processes_using_video0():
    try:
        # Get the output from lsof /dev/video0
        output = subprocess.check_output(["lsof", "/dev/video0"], text=True)
        lines = output.strip().split("\n")[1:]  # skip header
        pids = set()
        for line in lines:
            parts = line.split()
            if len(parts) >= 2:
                pid = int(parts[1])
                if pid != os.getpid():  # Don't kill current process
                    pids.add(pid)
        # Kill each process using SIGTERM
        for pid in pids:
            try:
                os.kill(pid, signal.SIGTERM)
                print(f"Killed process with PID: {pid}")
            except Exception as e:
                print(f"Failed to kill PID {pid}: {e}")
    except subprocess.CalledProcessError:
        print("No process is using /dev/video0.")

# Call before initializing camera
kill_processes_using_video0()

atexit.register(cleanup_gpio)

scheduler = BackgroundScheduler()
scheduler.start()

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

@app.route('/UnlockWithPasscode', methods=['POST'])
def UnlockWithPasscode():
    global last_unlock_time
    if time.time() - last_unlock_time < 3:
        return jsonify({'Message': 'Please wait before trying again'}), 429

    data = request.get_json()
    entered_passcode = data.get('entered_passcode')

    if not entered_passcode:
        return jsonify({'Message': 'Passcode required'}), 400

    username = session['username']
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'Message': 'User not found'}), 404

    if user.passcode != entered_passcode:
        return jsonify({'Message': 'Invalid passcode'}), 401

    unlock()
    time.sleep(5)
    lock()
    last_unlock_time = time.time()

    return jsonify({'Message': 'Unlocked successfully'}), 200

@app.route('/UnlockWithFaceID', methods=['POST'])
def UnlockWithFaceID():
    global last_unlock_time

    IMAGE_DIR = "/home/pi/Downloads/AutoMed/AutoMed-Project/Backend/static/images"
    TARGET_SIZE = (1280, 720)
    TEMP_CAPTURE_PATH = "/home/pi/captured_face.jpg"

    if time.time() - last_unlock_time < 3:
        return jsonify({'Message': 'Please wait before trying again'}), 429

    if 'username' not in session:
        return jsonify({'Message': 'Authentication required'}), 403

    username = session['username']

    def resize_with_padding(img, target_size):
        return ImageOps.pad(img, target_size, method=Image.BICUBIC, color=(0, 0, 0))

    # Clean user images: RGB + Resize + Remove EXIF
    for filename in os.listdir(IMAGE_DIR):
        if not filename.lower().endswith(".jpg"):
            continue
        if username.lower() not in filename.lower():
            continue

        path = os.path.join(IMAGE_DIR, filename)
        try:
            img = Image.open(path)
            img = ImageOps.exif_transpose(img)  # Correct orientation
            img = img.convert("RGB")  # Force RGB
            img = resize_with_padding(img, TARGET_SIZE)  # Resize with letterboxing

            # Save without EXIF
            img.save(path, format="JPEG", quality=85)
            print(f"[CLEANED] {filename} (RGB + resized to {TARGET_SIZE} + EXIF removed)")

        except Exception as e:
            print(f"[ERROR] Failed to process {filename}: {e}")

    # Generate face encodings
    known_encodings = []
    for filename in os.listdir(IMAGE_DIR):
        if not filename.lower().endswith(".jpg"):
            continue
        if username.lower() not in filename.lower():
            continue

        full_path = os.path.join(IMAGE_DIR, filename)
        try:
            image_array = face_recognition.load_image_file(full_path)
            locations = face_recognition.face_locations(image_array)
            encodings = face_recognition.face_encodings(image_array, locations)

            if encodings:
                known_encodings.append(encodings[0])
        except Exception as e:
            print(f"[ERROR] Failed to encode {filename}: {e}")

    if not known_encodings:
        return jsonify({'Message': 'No face data found for this user'}), 400

    # Call subprocess to capture face
    try:
        subprocess.run(["python3", "capture_face.py"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] Subprocess failed: {e}")
        return jsonify({'Message': 'Failed to capture image'}), 500

    # Load captured image and process
    try:
        image = Image.open(TEMP_CAPTURE_PATH)
        frame = np.array(image)
        face_locations = face_recognition.face_locations(frame)
        face_encodings = face_recognition.face_encodings(frame, face_locations)

        for encoding in face_encodings:
            results = face_recognition.compare_faces(known_encodings, encoding, tolerance=0.65)
            distances = face_recognition.face_distance(known_encodings, encoding)
            best_match_index = distances.argmin()

            if results[best_match_index]:
                unlock()
                time.sleep(5)
                lock()
                last_unlock_time = time.time()

                # Clean up temp image
                try:
                    os.remove(TEMP_CAPTURE_PATH)
                except Exception as e:
                    print(f"[WARN] Could not delete temp image: {e}")

                return jsonify({'Message': 'Unlocked successfully with FaceID'}), 200

        return jsonify({'Message': 'Face not recognized'}), 401

    except Exception as e:
        print(f"[ERROR] Failed to process captured image: {e}")
        return jsonify({'Message': 'Internal server error'}), 500

    finally:
        # Always remove temp image
        try:
            if os.path.exists(TEMP_CAPTURE_PATH):
                os.remove(TEMP_CAPTURE_PATH)
        except:
            pass

@app.route('/SetSched', methods=['POST'])
def SetSched():
    if 'username' not in session:
        return jsonify({'Message': 'Authentication required'}), 403

    prescriptions = request.get_json().get('prescriptions', [])
    if not prescriptions:
        return jsonify({'Message': 'No prescriptions provided'}), 400

    has_valid = False
    username = session['username']
    DOSE_DURATION_SEC = 5  # seconds per dose (adjust if needed)

    # Full Wipe
    all_jobs = scheduler.get_jobs()
    for job in all_jobs:
        scheduler.remove_job(job.id)
    print(f"[CLEANUP] All jobs cleared. Removed: {[job.id for job in all_jobs]}")

    active_prescriptions = []  # Store tuples: (slot, dose, actuator_num, pres_object)

    for i, pres in enumerate(prescriptions):
        filled = (
            bool(pres.get('drug')) and
            bool(pres.get('dose')) and
            bool(pres.get('time')) and
            isinstance(pres.get('selectedDays'), list) and len(pres['selectedDays']) > 0
        )

        empty = (
            not pres.get('drug') and
            not pres.get('dose') and
            not pres.get('time') and
            (not isinstance(pres.get('selectedDays'), list) or len(pres.get('selectedDays')) == 0)
        )

        existing = Prescription.query.filter_by(username=username, slot=i).first()

        if filled:
            has_valid = True
            if existing:
                existing.drug = pres['drug']
                existing.dose = pres['dose']
                existing.time = pres['time']
                existing.selectedDays = ",".join(pres['selectedDays'])
            else:
                new_pres = Prescription(
                    username=username,
                    slot=i,
                    drug=pres['drug'],
                    dose=pres['dose'],
                    time=pres['time'],
                    selectedDays=",".join(pres['selectedDays'])
                )
                db.session.add(new_pres)

            dose = int(pres['dose'])
            actuator_num = i + 1
            active_prescriptions.append((i, dose, actuator_num, pres))

        elif empty and existing:
            db.session.delete(existing)

        elif not filled and not empty:
            return jsonify({'Message': f'Prescription {i+1} is incomplete.'}), 400

    if not has_valid:
        return jsonify({'Message': 'Fill out at least one complete prescription.'}), 400

    for index, (slot, dose, actuator_num, pres) in enumerate(active_prescriptions):
        try:
            time_obj = datetime.strptime(pres['time'], "%I:%M %p").time()
            delay_sec = sum(active_prescriptions[j][1] for j in range(index)) * DOSE_DURATION_SEC

            for day in pres['selectedDays']:
                day_abbr = day.strip().lower()[:3]
                job_id = f"{username}_slot{slot}_{day_abbr}"

                job_func = partial(run_actuator_delayed, actuator_num, dose, delay_sec)

                scheduler.add_job(
                    func=job_func,
                    trigger='cron',
                    day_of_week=day_abbr,
                    hour=time_obj.hour,
                    minute=time_obj.minute,
                    id=job_id,
                    replace_existing=True
                )

        except Exception as e:
            print(f"[ERROR] Failed to schedule prescription slot {slot}: {e}")

    db.session.commit()

    for job in scheduler.get_jobs():
        print(f"[SCHEDULED] {job.id} - next run: {job.next_run_time}")

    return jsonify({'Message': 'Prescriptions saved and schedules set.'}), 201

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
        subprocess.run(["python3", "fin_act.py", "--init"])
        GPIO.cleanup()
        init_actuator_gpio()
        scheduler.remove_all_jobs()
    
    is_main = os.environ.get('WERKZEUG_RUN_MAIN', 'true') == 'true'

    if is_main:
        print("Starting server...")
        app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)
    #app.run(debug=True)