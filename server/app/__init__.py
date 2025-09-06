import os
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)

    # --- Config ---
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///lms.db")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "change-me")

    # --- Init extensions ---
    db.init_app(app)

    # 👇 IMPORTANT: import models so SQLAlchemy registers ALL tables (incl. Module/ModuleItem)
    from . import models  # do not delete

    migrate.init_app(app, db)
    jwt.init_app(app)

    CORS(
        app,
        resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}},
        supports_credentials=False,
        allow_headers=["Content-Type", "Authorization"],
        expose_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    )

    # --- Blueprints ---
    from .auth import auth_bp
    from .admin import admin_bp
    from .courses import courses_bp
    from .assignments import assignments_bp
    from .submissions import submissions_bp
    from .instructor import instructor_bp
    from .modules import modules_bp  # modules_bp should have url_prefix="/api" in its file

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(courses_bp, url_prefix="/api/courses")
    app.register_blueprint(assignments_bp, url_prefix="/api")
    app.register_blueprint(submissions_bp, url_prefix="/api")
    app.register_blueprint(instructor_bp, url_prefix="/api/instructor")
    app.register_blueprint(modules_bp)  # already has its own url_prefix

    # --- Health ---
    @app.get("/api/health")
    def health():
        return {"status": "ok"}, 200

    # --- JWT errors ---
    @jwt.unauthorized_loader
    def unauthorized_callback(reason):
        return jsonify(msg="Missing or invalid token", reason=reason), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(reason):
        return jsonify(msg="Invalid token", reason=reason), 401

    # --- DEV-ONLY: create missing tables if migrations haven't been run ---
    if os.getenv("AUTO_CREATE_TABLES", "0") == "1":
        with app.app_context():
            db.create_all()

    return app
