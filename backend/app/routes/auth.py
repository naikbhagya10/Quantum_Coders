from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from app.db import db_manager
from app.utils.auth_middleware import token_required
import datetime
import uuid

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    name = data.get('name', '').strip()
    age = data.get('age', 30)
    gender = data.get('gender', 'Not Specified')
    blood_group = data.get('blood_group', 'A+')

    if not email or not password or not name:
        return jsonify({'message': 'Name, email, and password are required.'}), 400

    users_col = db_manager.get_collection('users')
    existing_user = users_col.find_one({'email': email})
    if existing_user:
        return jsonify({'message': 'An account with this email address already exists.'}), 409

    user_id = str(uuid.uuid4())
    hashed_password = generate_password_hash(password)

    new_user = {
        'id': user_id,
        '_id': user_id,
        'email': email,
        'password': hashed_password,
        'name': name,
        'age': age,
        'gender': gender,
        'blood_group': blood_group,
        'created_at': datetime.datetime.utcnow().isoformat()
    }

    users_col.insert_one(new_user)
    access_token = create_access_token(identity=user_id)

    user_data = {
        'id': user_id,
        'name': name,
        'email': email,
        'age': age,
        'gender': gender,
        'blood_group': blood_group
    }

    return jsonify({
        'message': 'Registration successful! Welcome to MediClear AI.',
        'token': access_token,
        'user': user_data
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'message': 'Email and password are required.'}), 400

    users_col = db_manager.get_collection('users')
    user = users_col.find_one({'email': email})

    if not user or not check_password_hash(user['password'], password):
        return jsonify({'message': 'Invalid email or password.'}), 401

    user_id = user.get('id', user.get('_id'))
    access_token = create_access_token(identity=str(user_id))

    user_data = {
        'id': str(user_id),
        'name': user.get('name'),
        'email': user.get('email'),
        'age': user.get('age', 30),
        'gender': user.get('gender', 'Not Specified'),
        'blood_group': user.get('blood_group', 'A+')
    }

    return jsonify({
        'message': 'Login successful!',
        'token': access_token,
        'user': user_data
    }), 200


@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user_id):
    users_col = db_manager.get_collection('users')
    user = users_col.find_one({'id': current_user_id}) or users_col.find_one({'_id': current_user_id})

    if not user:
        return jsonify({'message': 'User profile not found.'}), 404

    user_data = {
        'id': str(user.get('id', user.get('_id'))),
        'name': user.get('name'),
        'email': user.get('email'),
        'age': user.get('age'),
        'gender': user.get('gender'),
        'blood_group': user.get('blood_group')
    }

    return jsonify({'user': user_data}), 200
