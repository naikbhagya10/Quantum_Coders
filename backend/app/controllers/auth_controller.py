"""
MediClear AI - Auth Controller Blueprint
"""
import uuid
import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from app.database import db_service
from app.utils.security import hash_password, verify_password, require_auth

auth_bp = Blueprint('auth_api', __name__)

@auth_bp.route('/register', methods=['POST'])
def register_patient():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    name = data.get('name', '').strip()
    age = data.get('age', 30)
    gender = data.get('gender', 'Not Specified')
    blood_group = data.get('blood_group', 'A+')

    if not email or not password or not name:
        return jsonify({'message': 'Name, email, and password are required.'}), 400

    users_col = db_service.get_collection('users')
    if users_col.find_one({'email': email}):
        return jsonify({'message': 'An account with this email address already exists.'}), 409

    user_id = str(uuid.uuid4())
    hashed_pwd = hash_password(password)

    new_user = {
        'id': user_id,
        '_id': user_id,
        'email': email,
        'password': hashed_pwd,
        'name': name,
        'age': age,
        'gender': gender,
        'blood_group': blood_group,
        'created_at': datetime.datetime.utcnow().isoformat()
    }

    users_col.insert_one(new_user)
    token = create_access_token(identity=user_id)

    user_profile = {
        'id': user_id,
        'name': name,
        'email': email,
        'age': age,
        'gender': gender,
        'blood_group': blood_group
    }

    return jsonify({
        'message': 'Registration successful! Welcome to MediClear AI.',
        'token': token,
        'user': user_profile
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login_patient():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'message': 'Email and password are required.'}), 400

    users_col = db_service.get_collection('users')
    user = users_col.find_one({'email': email})

    if not user or not verify_password(user['password'], password):
        return jsonify({'message': 'Invalid email or password.'}), 401

    user_id = str(user.get('id', user.get('_id')))
    token = create_access_token(identity=user_id)

    user_profile = {
        'id': user_id,
        'name': user.get('name'),
        'email': user.get('email'),
        'age': user.get('age', 30),
        'gender': user.get('gender', 'Not Specified'),
        'blood_group': user.get('blood_group', 'A+')
    }

    return jsonify({
        'message': 'Login successful!',
        'token': token,
        'user': user_profile
    }), 200


@auth_bp.route('/me', methods=['GET'])
@require_auth
def get_user_profile(user_id):
    users_col = db_service.get_collection('users')
    user = users_col.find_one({'id': user_id}) or users_col.find_one({'_id': user_id})

    if not user:
        return jsonify({'message': 'User profile not found.'}), 404

    profile = {
        'id': str(user.get('id', user.get('_id'))),
        'name': user.get('name'),
        'email': user.get('email'),
        'age': user.get('age', 30),
        'gender': user.get('gender', 'Not Specified'),
        'blood_group': user.get('blood_group', 'A+')
    }

    return jsonify({'user': profile}), 200
