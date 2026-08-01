"""
MediClear AI - Backend Entrypoint Script
"""
import os
from app import create_app

app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('MEDICLEAR_PORT', '5001'))
    print(f"🚀 MediClear AI Backend API running on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
