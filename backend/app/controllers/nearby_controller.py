"""
MediClear AI - Nearby Healthcare Controller Blueprint
"""
from flask import Blueprint, request, jsonify
from app.services.healthcare_finder import find_nearby_facilities

nearby_bp = Blueprint('nearby_api', __name__)

@nearby_bp.route('/hospitals', methods=['GET'])
def get_hospitals():
    lat = request.args.get('lat', type=float)
    lng = request.args.get('lng', type=float)
    specialty = request.args.get('specialty', '')

    facilities = find_nearby_facilities(lat=lat, lng=lng, specialty=specialty)
    return jsonify({
        'facilities': facilities,
        'count': len(facilities)
    }), 200
