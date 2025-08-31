import os
from flask import Flask, jsonify, request  # ✅ added request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv


# Load environment variables
load_dotenv()

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)

    # Configuration
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///lms.db")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "change-me")

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # ✅ Correct indentation + headers
    CORS(
        app,
        resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}},
        supports_credentials=False,
        allow_headers=["Content-Type", "Authorization"],
        expose_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    )

    # 🔎 TEMP debug: log auth headers (remove later)
    # @app.before_request
    # def _dbg_auth_header():
    #     if request.path.startswith("/api/"):
    #         print("AUTH HEADER:", request.headers.get("Authorization"))

    # Import blueprints (make sure these files exist)
    from .auth import auth_bp
    from .admin import admin_bp
    from .courses import courses_bp
    from .assignments import assignments_bp
    from .submissions import submissions_bp
    from .instructor import instructor_bp

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(courses_bp, url_prefix="/api/courses")
    app.register_blueprint(assignments_bp, url_prefix="/api")
    app.register_blueprint(submissions_bp, url_prefix="/api")
    app.register_blueprint(instructor_bp, url_prefix="/api/instructor")

    # Health check route
    @app.get("/api/health")
    def health():
        return {"status": "ok"}, 200

    # JWT error handlers
    @jwt.unauthorized_loader
    def unauthorized_callback(reason):
        return jsonify(msg="Missing or invalid token", reason=reason), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(reason):
        return jsonify(msg="Invalid token", reason=reason), 401

    return app
