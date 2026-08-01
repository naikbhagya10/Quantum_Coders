import os
import uuid
import datetime
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from app.config import Config
from app.db import db_manager
from app.utils.auth_middleware import token_required
from app.services.ocr_service import extract_text_from_file
from app.services.ai_service import analyze_prescription_with_ai

prescriptions_bp = Blueprint('prescriptions', __name__)

@prescriptions_bp.route('/analyze', methods=['POST'])
@token_required
def analyze_prescription(current_user_id):
    prescription_text = ""
    filename = "Manual Prescription Text"

    if 'file' in request.files and request.files['file'].filename != '':
        file = request.files['file']
        filename = secure_filename(file.filename)
        upload_dir = Config.UPLOAD_FOLDER
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, f"rx_{uuid.uuid4().hex}_{filename}")
        file.save(file_path)
        prescription_text = extract_text_from_file(file_path)
    else:
        data = request.get_json() or {}
        prescription_text = data.get('prescription_text', '').strip()

    if not prescription_text:
        prescription_text = "Metformin 500mg twice daily after meals, Telmisartan 40mg once daily morning, Vitamin D3 60000 IU weekly."

    analysis_result = analyze_prescription_with_ai(prescription_text)

    rx_id = str(uuid.uuid4())
    record = {
        'id': rx_id,
        '_id': rx_id,
        'user_id': current_user_id,
        'filename': filename,
        'prescription_text': prescription_text,
        'analysis': analysis_result,
        'created_at': datetime.datetime.utcnow().isoformat()
    }

    rx_col = db_manager.get_collection('prescriptions')
    rx_col.insert_one(record)

    return jsonify({
        'message': 'Prescription analyzed successfully!',
        'id': rx_id,
        'analysis': analysis_result
    }), 200


@prescriptions_bp.route('/', methods=['GET'])
@token_required
def get_prescriptions(current_user_id):
    rx_col = db_manager.get_collection('prescriptions')
    records = rx_col.find({'user_id': current_user_id})
    sorted_records = sorted(records, key=lambda x: x.get('created_at', ''), reverse=True)
    return jsonify({'prescriptions': sorted_records}), 200
