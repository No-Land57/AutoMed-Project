from flask import Blueprint, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from App import User, db

set_sched = Blueprint('set_sched', __name__)

class Prescription(db.Model):
    drug = db.Column(db.String(120))
    dose = db.Column(db.String(120),nullable=False)
    time = db.Column(db.String(120),nullable=False)
    selectedDays = db.Column(db.String(120),nullable=False)

@set_sched.route('/SetSched', methods=['POST'])
def SetSched():
    data = request.get_json()
    drug = data.get('drug')
    dose = data.get('dose')
    time = data.get('time')
    selectedDays = data.get('selectedDays')

    if not drug or not dose or not time or not selectedDays:
        return jsonify({'Message': 'All fields are required'}), 400

    for prescription in prescription:
        new_prescription = Prescription(drug='drug', dose='dose', time='time', selectedDays=', '.join(selectedDays))
        db.session.add(new_prescription)
        db.session.commit()

    return jsonify({'Message': 'Prescription created successfully'}), 201       