"""
MediClear AI - Security & Authentication Utilities
"""
from functools import wraps
from flask import request, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash

def hash_password(password: str) -> str:
    return generate_password_hash(password)

def verify_password(stored_hash: str, password: str) -> bool:
    return check_password_hash(stored_hash, password)

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
        except Exception as e:
            return jsonify({'message': 'Authentication required', 'error': str(e)}), 401
        return f(user_id, *args, **kwargs)
    return decorated
