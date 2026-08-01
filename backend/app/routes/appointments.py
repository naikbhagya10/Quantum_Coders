import uuid
import datetime
from flask import Blueprint, request, jsonify
from app.db import db_manager
from app.utils.auth_middleware import token_required

appointments_bp = Blueprint('appointments', __name__)

@appointments_bp.route('/', methods=['POST'])
@token_required
def schedule_appointment(current_user_id):
    data = request.get_json() or {}
    doctor_name = data.get('doctor_name', '').strip()
    specialty = data.get('specialty', '').strip()
    facility_name = data.get('facility_name', 'City General Healthcare').strip()
    appointment_date = data.get('appointment_date', '').strip()
    appointment_time = data.get('appointment_time', '').strip()
    reason = data.get('reason', '').strip()
    reminder_minutes_before = data.get('reminder_minutes_before', 60)

    if not doctor_name or not appointment_date or not appointment_time:
        return jsonify({'message': 'Doctor name, appointment date, and time are required.'}), 400

    appointment_id = str(uuid.uuid4())
    record = {
        'id': appointment_id,
        '_id': appointment_id,
        'user_id': current_user_id,
        'doctor_name': doctor_name,
        'specialty': specialty or 'General Physician',
        'facility_name': facility_name,
        'appointment_date': appointment_date,
        'appointment_time': appointment_time,
        'reason': reason or 'Routine Checkup & Report Consultation',
        'reminder_minutes_before': reminder_minutes_before,
        'status': 'Upcoming',
        'created_at': datetime.datetime.utcnow().isoformat()
    }

    appointments_col = db_manager.get_collection('appointments')
    appointments_col.insert_one(record)

    return jsonify({
        'message': 'Appointment scheduled successfully! Reminder notification active.',
        'appointment': record
    }), 201


@appointments_bp.route('/', methods=['GET'])
@token_required
def get_appointments(current_user_id):
    appointments_col = db_manager.get_collection('appointments')
    records = appointments_col.find({'user_id': current_user_id})
    sorted_records = sorted(records, key=lambda x: (x.get('appointment_date', ''), x.get('appointment_time', '')), reverse=False)
    return jsonify({'appointments': sorted_records}), 200


@appointments_bp.route('/<appointment_id>/cancel', methods=['PUT'])
@token_required
def cancel_appointment(current_user_id, appointment_id):
    appointments_col = db_manager.get_collection('appointments')
    result = appointments_col.update_one(
        {'id': appointment_id, 'user_id': current_user_id},
        {'$set': {'status': 'Cancelled'}}
    )

    return jsonify({'message': 'Appointment cancelled successfully.'}), 200
