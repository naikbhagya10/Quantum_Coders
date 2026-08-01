"""
MediClear AI - Symptoms Controller Blueprint
"""
import uuid
import datetime
from flask import Blueprint, request, jsonify
from app.database import db_service
from app.utils.security import require_auth
from app.services.gemini_ai import analyze_symptoms_triage

symptoms_bp = Blueprint('symptoms_api', __name__)

@symptoms_bp.route('/check', methods=['POST'])
@require_auth
def evaluate_symptoms(user_id):
    data = request.get_json() or {}
    symptoms = data.get('symptoms', '').strip()
    duration = data.get('duration', '2-3 days')
    severity = data.get('severity', 'Moderate')
    age = data.get('age', 30)

    if not symptoms:
        return jsonify({'message': 'Symptom description is required.'}), 400

    result = analyze_symptoms_triage(symptoms, duration, severity, age)

    record_id = str(uuid.uuid4())
    record = {
        'id': record_id,
        '_id': record_id,
        'user_id': user_id,
        'symptoms': symptoms,
        'duration': duration,
        'user_severity': severity,
        'analysis': result,
        'created_at': datetime.datetime.utcnow().isoformat()
    }

    col = db_service.get_collection('symptoms')
    col.insert_one(record)

    return jsonify({
        'message': 'Symptom triage completed!',
        'id': record_id,
        'result': result
    }), 200


@symptoms_bp.route('/history', methods=['GET'])
@require_auth
def get_symptom_logs(user_id):
    col = db_service.get_collection('symptoms')
    records = col.find({'user_id': user_id})
    sorted_records = sorted(records, key=lambda x: x.get('created_at', ''), reverse=True)
    return jsonify({'symptoms': sorted_records}), 200
