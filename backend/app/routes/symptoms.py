import uuid
import datetime
from flask import Blueprint, request, jsonify
from app.db import db_manager
from app.utils.auth_middleware import token_required
from app.services.ai_service import analyze_symptoms_with_ai

symptoms_bp = Blueprint('symptoms', __name__)

@symptoms_bp.route('/check', methods=['POST'])
@token_required
def check_symptoms(current_user_id):
    data = request.get_json() or {}
    symptoms = data.get('symptoms', '').strip()
    duration = data.get('duration', 'A few days')
    severity_input = data.get('severity', 'Moderate')
    age = data.get('age', 30)

    if not symptoms:
        return jsonify({'message': 'Please describe your symptoms.'}), 400

    # Execute AI symptom analysis & triage logic
    triage_result = analyze_symptoms_with_ai(symptoms, duration, severity_input, age)

    # Save to history database
    symptom_id = str(uuid.uuid4())
    record = {
        'id': symptom_id,
        '_id': symptom_id,
        'user_id': current_user_id,
        'symptoms': symptoms,
        'duration': duration,
        'user_severity': severity_input,
        'analysis': triage_result,
        'created_at': datetime.datetime.utcnow().isoformat()
    }

    symptoms_col = db_manager.get_collection('symptoms')
    symptoms_col.insert_one(record)

    return jsonify({
        'message': 'Symptom analysis completed!',
        'id': symptom_id,
        'result': triage_result
    }), 200


@symptoms_bp.route('/history', methods=['GET'])
@token_required
def get_symptom_history(current_user_id):
    symptoms_col = db_manager.get_collection('symptoms')
    records = symptoms_col.find({'user_id': current_user_id})
    sorted_records = sorted(records, key=lambda x: x.get('created_at', ''), reverse=True)
    return jsonify({'symptoms': sorted_records}), 200
