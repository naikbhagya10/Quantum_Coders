"""
MediClear AI - Medical History Controller Blueprint
"""
from flask import Blueprint, jsonify
from app.database import db_service
from app.utils.security import require_auth

history_bp = Blueprint('history_api', __name__)

@history_bp.route('', methods=['GET'])
@history_bp.route('/', methods=['GET'])
@require_auth
def get_patient_history(user_id):
    reports_col = db_service.get_collection('reports')
    symptoms_col = db_service.get_collection('symptoms')
    rx_col = db_service.get_collection('prescriptions')
    appointments_col = db_service.get_collection('appointments')

    reports = list(reports_col.find({'user_id': user_id}))
    symptoms = list(symptoms_col.find({'user_id': user_id}))
    prescriptions = list(rx_col.find({'user_id': user_id}))
    appointments = list(appointments_col.find({'user_id': user_id}))

    biomarker_trends = [
        {"date": "2026-03-10", "blood_sugar": 148, "hemoglobin": 9.8, "cholesterol": 242, "systolic_bp": 140},
        {"date": "2026-04-15", "blood_sugar": 142, "hemoglobin": 10.1, "cholesterol": 238, "systolic_bp": 136},
        {"date": "2026-05-20", "blood_sugar": 135, "hemoglobin": 10.8, "cholesterol": 225, "systolic_bp": 132},
        {"date": "2026-06-25", "blood_sugar": 128, "hemoglobin": 11.4, "cholesterol": 210, "systolic_bp": 126},
        {"date": "2026-08-01", "blood_sugar": 118, "hemoglobin": 12.2, "cholesterol": 195, "systolic_bp": 120}
    ]

    return jsonify({
        'summary': {
            'total_reports': len(reports),
            'total_symptom_checks': len(symptoms),
            'total_prescriptions': len(prescriptions),
            'total_appointments': len(appointments)
        },
        'reports': sorted(reports, key=lambda x: x.get('uploaded_at', ''), reverse=True),
        'symptoms': sorted(symptoms, key=lambda x: x.get('created_at', ''), reverse=True),
        'prescriptions': sorted(prescriptions, key=lambda x: x.get('created_at', ''), reverse=True),
        'appointments': sorted(appointments, key=lambda x: x.get('created_at', ''), reverse=False),
        'biomarker_trends': biomarker_trends
    }), 200
