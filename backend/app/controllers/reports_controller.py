"""
MediClear AI - Reports Controller Blueprint
"""
import os
import re
import uuid
import datetime
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from app.config import MediClearConfig
from app.database import db_service
from app.utils.security import require_auth
from app.services.ocr_engine import process_document_ocr
from app.services.gemini_ai import analyze_report_text

reports_bp = Blueprint('reports_api', __name__)
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'bmp', 'webp'}
SUPPORTED_LANGUAGES = {'English', 'Kannada', 'Hindi'}

def get_request_language():
    language = (
        request.headers.get('X-Language')
        or request.form.get('language')
        or request.args.get('language')
        or 'English'
    )
    return language if language in SUPPORTED_LANGUAGES else 'English'

def is_allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def looks_like_medical_report(extracted_text: str) -> bool:
    text = (extracted_text or '').lower()
    if not text.strip():
        return False

    medical_markers = [
        'hemoglobin', 'hba1c', 'cholesterol', 'glucose', 'creatinine', 'platelet',
        'cbc', 'complete blood count', 'metabolic panel', 'thyroid', 'ldl', 'hdl',
        'wbc', 'rbc', 'fasting', 'urine', 'serum', 'laboratory', 'report',
        'reference range', 'patient name', 'test parameter', 'normal', 'abnormal'
    ]
    marker_hits = sum(1 for marker in medical_markers if marker in text)

    lab_unit_patterns = [
        r'\b\d+(?:\.\d+)?\s*(?:mg/dl|g/dl|mmol/l|k/mcl|mcg/ml|iu/l|ng/ml|%|mmhg)\b',
        r'\b(?:low|high|normal|borderline)\b'
    ]
    lab_signal_hits = sum(1 for pattern in lab_unit_patterns if re.search(pattern, text, flags=re.IGNORECASE))

    resume_markers = [
        'experience', 'education', 'skills', 'company', 'project', 'resume',
        'objective', 'employment', 'qualification', 'contact info'
    ]
    resume_hits = sum(1 for marker in resume_markers if marker in text)

    if marker_hits >= 2 or (marker_hits >= 1 and lab_signal_hits >= 1):
        return True

    if resume_hits >= 2 and marker_hits == 0:
        return False

    return False


@reports_bp.route('/upload', methods=['POST'])
@require_auth
def upload_report(user_id):
    if 'file' not in request.files:
        return jsonify({'message': 'No file uploaded'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': 'No file selected'}), 400

    if file and is_allowed_file(file.filename):
        filename = secure_filename(file.filename)
        upload_dir = MediClearConfig.UPLOAD_FOLDER
        os.makedirs(upload_dir, exist_ok=True)

        saved_name = f"{uuid.uuid4().hex}_{filename}"
        file_path = os.path.join(upload_dir, saved_name)
        file.save(file_path)

        # OCR & AI Processing
        extracted_txt = process_document_ocr(file_path)
        if not looks_like_medical_report(extracted_txt):
            return jsonify({
                'message': 'This file does not appear to be a medical report. Please upload a medical lab report, blood test, urine panel, or other clinical diagnostic report.'
            }), 400

        language = get_request_language()
        analysis_data = analyze_report_text(extracted_txt, language)

        report_id = str(uuid.uuid4())
        record = {
            'id': report_id,
            '_id': report_id,
            'user_id': user_id,
            'original_filename': filename,
            'file_path': file_path,
            'extracted_text': extracted_txt,
            'analysis': analysis_data,
            'uploaded_at': datetime.datetime.utcnow().isoformat()
        }

        col = db_service.get_collection('reports')
        col.insert_one(record)

        return jsonify({
            'message': 'Report processed successfully!',
            'report_id': report_id,
            'extracted_text': extracted_txt,
            'analysis': analysis_data
        }), 201

    return jsonify({'message': 'Invalid file format. Supported: PDF, PNG, JPG, JPEG, WEBP.'}), 400


@reports_bp.route('/sample', methods=['POST'])
@require_auth
def process_sample_report(user_id):
    sample_txt = """
    PATIENT MEDICAL LABORATORY REPORT - COMPLETE BLOOD COUNT (CBC) & METABOLIC PANEL
    Patient Name: Sample Patient | Age: 40 | Gender: Male
    Date: 2026-08-01 | Ref Doctor: Dr. Sarah Jenkins

    TEST PARAMETER           RESULT      REFERENCE RANGE     UNIT     STATUS
    -------------------------------------------------------------------------
    Hemoglobin               10.2        13.5 - 17.5         g/dL     LOW (Anemia Risk)
    Red Blood Cell (RBC)     3.8         4.3 - 5.9           M/mcL    LOW
    White Blood Cell (WBC)   11.8        4.5 - 11.0          K/mcL    HIGH (Infection/Inflammation)
    Fasting Blood Glucose    142         70 - 99             mg/dL    HIGH (Prediabetes/Diabetes)
    HbA1c                    6.8%        < 5.7%              %        HIGH
    Total Cholesterol        235         < 200               mg/dL    HIGH (Hyperlipidemia)
    Serum Creatinine         1.0         0.7 - 1.3           mg/dL    NORMAL
    """

    language = get_request_language()
    analysis_data = analyze_report_text(sample_txt, language)
    report_id = str(uuid.uuid4())
    record = {
        'id': report_id,
        '_id': report_id,
        'user_id': user_id,
        'original_filename': 'Sample_Blood_Panel_Report.pdf',
        'file_path': 'sample',
        'extracted_text': sample_txt,
        'analysis': analysis_data,
        'uploaded_at': datetime.datetime.utcnow().isoformat()
    }

    col = db_service.get_collection('reports')
    col.insert_one(record)

    return jsonify({
        'message': 'Sample report analyzed successfully!',
        'report_id': report_id,
        'extracted_text': sample_txt,
        'analysis': analysis_data
    }), 200


@reports_bp.route('', methods=['GET'])
@reports_bp.route('/', methods=['GET'])
@require_auth
def get_user_reports(user_id):
    col = db_service.get_collection('reports')
    user_reports = col.find({'user_id': user_id})
    sorted_reports = sorted(user_reports, key=lambda x: x.get('uploaded_at', ''), reverse=True)
    return jsonify({'reports': sorted_reports}), 200


@reports_bp.route('/<report_id>', methods=['GET'])
@require_auth
def get_report_details(user_id, report_id):
    col = db_service.get_collection('reports')
    report = col.find_one({'id': report_id, 'user_id': user_id}) or col.find_one({'_id': report_id, 'user_id': user_id})
    if not report:
        return jsonify({'message': 'Report not found.'}), 404
    return jsonify({'report': report}), 200
