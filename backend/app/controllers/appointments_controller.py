"""
MediClear AI - Appointments Controller Blueprint
"""
import uuid
import datetime
from flask import Blueprint, request, jsonify
from app.database import db_service
from app.utils.security import require_auth

appointments_bp = Blueprint('appointments_api', __name__)

@appointments_bp.route('', methods=['POST'])
@require_auth
def create_appointment(user_id):
    data = request.get_json() or {}
    doctor_name = data.get('doctor_name', '').strip()
    specialty = data.get('specialty', 'General Physician').strip()
    facility_name = data.get('facility_name', 'City Care Specialty Hospital').strip()
    appointment_date = data.get('appointment_date', '').strip()
    appointment_time = data.get('appointment_time', '').strip()
    reason = data.get('reason', 'Routine Consultation').strip()
    reminder_minutes_before = data.get('reminder_minutes_before', 60)

    if not doctor_name or not appointment_date or not appointment_time:
        return jsonify({'message': 'Doctor name, appointment date, and time are required.'}), 400

    appointment_id = str(uuid.uuid4())
    record = {
        'id': appointment_id,
        '_id': appointment_id,
        'user_id': user_id,
        'doctor_name': doctor_name,
        'specialty': specialty,
        'facility_name': facility_name,
        'appointment_date': appointment_date,
        'appointment_time': appointment_time,
        'reason': reason,
        'reminder_minutes_before': reminder_minutes_before,
        'status': 'Upcoming',
        'created_at': datetime.datetime.utcnow().isoformat()
    }

    col = db_service.get_collection('appointments')
    col.insert_one(record)

    return jsonify({
        'message': 'Appointment scheduled successfully! Reminder active.',
        'appointment': record
    }), 201


@appointments_bp.route('', methods=['GET'])
@require_auth
def list_appointments(user_id):
    col = db_service.get_collection('appointments')
    records = col.find({'user_id': user_id})
    sorted_records = sorted(records, key=lambda x: (x.get('appointment_date', ''), x.get('appointment_time', '')), reverse=False)
    return jsonify({'appointments': sorted_records}), 200


@appointments_bp.route('/<appointment_id>/cancel', methods=['PUT'])
@require_auth
def cancel_appointment_status(user_id, appointment_id):
    col = db_service.get_collection('appointments')
    col.update_one(
        {'id': appointment_id, 'user_id': user_id},
        {'$set': {'status': 'Cancelled'}}
    )
    return jsonify({'message': 'Appointment cancelled successfully.'}), 200
