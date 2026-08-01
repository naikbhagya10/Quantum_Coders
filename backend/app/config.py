"""
MediClear AI - Backend Configuration Module
"""
import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class MediClearConfig:
    SECRET_KEY = os.getenv('SECRET_KEY', 'mediclear_ai_app_secret_key_2026')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'mediclear_ai_jwt_auth_key_2026')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/mediclear_ai_db')
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
    GOOGLE_MAPS_API_KEY = os.getenv('GOOGLE_MAPS_API_KEY', '')
    
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB file limit
