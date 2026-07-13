import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager
from config import Config
from models import db
from routes.applications import apps_bp
from routes.resumes import resumes_bp

load_dotenv()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    @app.after_request
    def after_request(response):
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        return response
    
    CORS(app)
    db.init_app(app)
    JWTManager(app)
    
    from routes.auth import auth_bp
    from routes.jobs import jobs_bp         
    
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(jobs_bp, url_prefix='/api') 
    app.register_blueprint(apps_bp, url_prefix='/api')
    app.register_blueprint(resumes_bp, url_prefix='/api')
    with app.app_context():
        db.create_all()
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
