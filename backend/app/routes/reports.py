import os
import uuid
import datetime
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from app.config import Config
from app.db import db_manager
from app.utils.auth_middleware import token_required
from app.services.ocr_service import extract_text_from_file
from app.services.ai_service import analyze_medical_report_with_ai

reports_bp = Blueprint('reports', __name__)

ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'bmp', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@reports_bp.route('/upload', methods=['POST'])
@token_required
def upload_and_analyze_report(current_user_id):
    if 'file' not in request.files:
        return jsonify({'message': 'No file uploaded'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': 'No file selected'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        upload_dir = Config.UPLOAD_FOLDER
        os.makedirs(upload_dir, exist_ok=True)

        saved_filename = f"{uuid.uuid4().hex}_{filename}"
        file_path = os.path.join(upload_dir, saved_filename)
        file.save(file_path)

        # 1. Perform OCR Text Extraction
        extracted_text = extract_text_from_file(file_path)

        # 2. Analyze extracted text using AI
        analysis_result = analyze_medical_report_with_ai(extracted_text)

        # 3. Store record in MongoDB / JSON Store
        report_id = str(uuid.uuid4())
        report_record = {
            'id': report_id,
            '_id': report_id,
            'user_id': current_user_id,
            'original_filename': filename,
            'file_path': file_path,
            'extracted_text': extracted_text,
            'analysis': analysis_result,
            'uploaded_at': datetime.datetime.utcnow().isoformat()
        }

        reports_col = db_manager.get_collection('reports')
        reports_col.insert_one(report_record)

        return jsonify({
            'message': 'Medical report analyzed successfully!',
            'report_id': report_id,
            'extracted_text': extracted_text,
            'analysis': analysis_result
        }), 201

    return jsonify({'message': 'Invalid file format. Allowed formats: PDF, PNG, JPG, JPEG, WEBP.'}), 400


@reports_bp.route('/sample', methods=['POST'])
@token_required
def analyze_sample_report(current_user_id):
    """Provides instant sample medical report analysis for demonstration testing."""
    sample_text = """
    PATIENT MEDICAL LABORATORY REPORT - COMPLETE BLOOD COUNT (CBC) & METABOLIC PANEL
    Patient Name: John Doe | Age: 42 | Gender: Male
    Date: 2026-07-28 | Ref Doctor: Dr. Sarah Jenkins

    TEST PARAMETER           RESULT      REFERENCE RANGE     UNIT     STATUS
    -------------------------------------------------------------------------
    Hemoglobin               10.2        13.5 - 17.5         g/dL     LOW (Anemia Risk)
    Red Blood Cell (RBC)     3.8         4.3 - 5.9           M/mcL    LOW
    White Blood Cell (WBC)   11.8        4.5 - 11.0          K/mcL    HIGH (Infection/Inflammation)
    Platelets                210         150 - 450           K/mcL    NORMAL
    Fasting Blood Glucose    142         70 - 99             mg/dL    HIGH (Prediabetes/Diabetes)
    HbA1c                    6.8%        < 5.7%              %        HIGH
    Total Cholesterol        235         < 200               mg/dL    HIGH (Hyperlipidemia)
    HDL Cholesterol          38          > 40                mg/dL    LOW
    LDL Cholesterol          158         < 100               mg/dL    HIGH
    Serum Creatinine         1.1         0.7 - 1.3           mg/dL    NORMAL
    Thyroid Stimulating (TSH) 5.4        0.4 - 4.0           mIU/L    HIGH (Mild Hypothyroidism)
    """

    analysis_result = analyze_medical_report_with_ai(sample_text)

    report_id = str(uuid.uuid4())
    report_record = {
        'id': report_id,
        '_id': report_id,
        'user_id': current_user_id,
        'original_filename': 'Sample_Blood_Panel_Report.pdf',
        'file_path': 'sample',
        'extracted_text': sample_text,
        'analysis': analysis_result,
        'uploaded_at': datetime.datetime.utcnow().isoformat()
    }

    reports_col = db_manager.get_collection('reports')
    reports_col.insert_one(report_record)

    return jsonify({
        'message': 'Sample report analyzed successfully!',
        'report_id': report_id,
        'extracted_text': sample_text,
        'analysis': analysis_result
    }), 200


@reports_bp.route('/', methods=['GET'])
@token_required
def get_user_reports(current_user_id):
    reports_col = db_manager.get_collection('reports')
    user_reports = reports_col.find({'user_id': current_user_id})

    # Sort descending by upload date
    sorted_reports = sorted(user_reports, key=lambda x: x.get('uploaded_at', ''), reverse=True)

    return jsonify({'reports': sorted_reports}), 200


@reports_bp.route('/<report_id>', methods=['GET'])
@token_required
def get_report_by_id(current_user_id, report_id):
    reports_col = db_manager.get_collection('reports')
    report = reports_col.find_one({'id': report_id, 'user_id': current_user_id}) or reports_col.find_one({'_id': report_id, 'user_id': current_user_id})

    if not report:
        return jsonify({'message': 'Report not found.'}), 404

    return jsonify({'report': report}), 200
