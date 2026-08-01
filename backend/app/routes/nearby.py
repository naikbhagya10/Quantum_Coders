from flask import Blueprint, request, jsonify
from app.services.maps_service import search_nearby_healthcare

nearby_bp = Blueprint('nearby', __name__)

@nearby_bp.route('/hospitals', methods=['GET'])
def get_nearby_hospitals():
    lat = request.args.get('lat', type=float)
    lng = request.args.get('lng', type=float)
    query = request.args.get('query', 'hospital')
    specialty = request.args.get('specialty', '')

    facilities = search_nearby_healthcare(lat=lat, lng=lng, query=query, specialty=specialty)
    return jsonify({
        'facilities': facilities,
        'count': len(facilities)
    }), 200
