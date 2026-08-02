"""
MediClear AI - Prescriptions Controller Blueprint
"""
import os
import uuid
import datetime
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from app.config import MediClearConfig
from app.database import db_service
from app.utils.security import require_auth
from app.services.ocr_engine import process_document_ocr
from app.services.gemini_ai import analyze_prescription_pharmacology, looks_like_prescription_text

prescriptions_bp = Blueprint('prescriptions_api', __name__)
SUPPORTED_LANGUAGES = {'English', 'Kannada', 'Hindi'}

def get_request_language():
    json_data = request.get_json(silent=True) or {}
    language = (
        request.headers.get('X-Language')
        or request.form.get('language')
        or json_data.get('language')
        or request.args.get('language')
        or 'English'
    )
    return language if language in SUPPORTED_LANGUAGES else 'English'

@prescriptions_bp.route('/analyze', methods=['POST'])
@require_auth
def process_prescription(user_id):
    rx_text = ""
    filename = "Manual Prescription Note"

    if 'file' in request.files and request.files['file'].filename != '':
        file = request.files['file']
        filename = secure_filename(file.filename)
        upload_dir = MediClearConfig.UPLOAD_FOLDER
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, f"rx_{uuid.uuid4().hex}_{filename}")
        file.save(file_path)
        rx_text = process_document_ocr(file_path)
    else:
        data = request.get_json() or {}
        rx_text = data.get('prescription_text', '').strip()

    if not rx_text:
        return jsonify({
            'message': 'Please provide a prescription text or upload a valid medicine prescription file.',
            'invalid_input': True
        }), 400

    if not looks_like_prescription_text(rx_text):
        return jsonify({
            'message': 'Prescribed medication text was not detected. Enter a medicine name, dosage, frequency, or timing.',
            'invalid_input': True
        }), 400

    language = get_request_language()
    analysis_result = analyze_prescription_pharmacology(rx_text, language)

    rx_id = str(uuid.uuid4())
    record = {
        'id': rx_id,
        '_id': rx_id,
        'user_id': user_id,
        'filename': filename,
        'prescription_text': rx_text,
        'analysis': analysis_result,
        'created_at': datetime.datetime.utcnow().isoformat()
    }

    col = db_service.get_collection('prescriptions')
    col.insert_one(record)

    return jsonify({
        'message': 'Prescription analyzed successfully!',
        'id': rx_id,
        'analysis': analysis_result
    }), 200


@prescriptions_bp.route('', methods=['GET'])
@prescriptions_bp.route('/', methods=['GET'])
@require_auth
def get_user_prescriptions(user_id):
    col = db_service.get_collection('prescriptions')
    records = col.find({'user_id': user_id})
    sorted_records = sorted(records, key=lambda x: x.get('created_at', ''), reverse=True)
    return jsonify({'prescriptions': sorted_records}), 200
