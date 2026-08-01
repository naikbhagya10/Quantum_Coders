"""
MediClear AI - Flask Application Factory
"""
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from app.config import MediClearConfig
from app.database import db_service

def create_app():
    app = Flask(__name__)
    app.config.from_object(MediClearConfig)

    # Enable CORS for React Frontend
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize JWT Manager
    JWTManager(app)

    # Connect to MongoDB / JSON Persistence Store
    db_service.connect(app.config['MONGO_URI'])

    # Register Controller Blueprints
    from app.controllers.auth_controller import auth_bp
    from app.controllers.reports_controller import reports_bp
    from app.controllers.symptoms_controller import symptoms_bp
    from app.controllers.prescriptions_controller import prescriptions_bp
    from app.controllers.appointments_controller import appointments_bp
    from app.controllers.nearby_controller import nearby_bp
    from app.controllers.history_controller import history_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(reports_bp, url_prefix='/api/reports')
    app.register_blueprint(symptoms_bp, url_prefix='/api/symptoms')
    app.register_blueprint(prescriptions_bp, url_prefix='/api/prescriptions')
    app.register_blueprint(appointments_bp, url_prefix='/api/appointments')
    app.register_blueprint(nearby_bp, url_prefix='/api/nearby')
    app.register_blueprint(history_bp, url_prefix='/api/history')

    @app.route('/api/health', methods=['GET'])
    @app.route('/health', methods=['GET'])
    def health_check():
        return {
            'status': 'online',
            'app': 'MediClear AI Backend Engine',
            'version': '2.0'
        }, 200

    @app.route('/', methods=['GET'])
    def api_home():
        return {
            'status': 'online',
            'message': 'MediClear AI backend is running.',
            'health': '/api/health'
        }, 200

    return app
