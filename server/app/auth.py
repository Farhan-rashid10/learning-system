from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from .models import db, User

auth_bp = Blueprint("auth", __name__)

# User login route
@auth_bp.post("/login")
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify(msg="email and password required"), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify(msg="Invalid credentials"), 401

    # Create JWT token
    token = create_access_token(
        identity=str(user.id), 
        additional_claims={
            "role": user.role,
            "name": user.name,
            "email": user.email,
        },
    )

    return jsonify(
        access_token=token,
        user={
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
        },
    ), 200
