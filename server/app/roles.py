from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt

def roles_required(*roles):
    """
    Restrict access to endpoints by roles.
    Example:
        @app.route("/admin")
        @roles_required("admin")
        def admin_dashboard():
            return {"msg": "Welcome, admin!"}
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            user_role = claims.get("role")
            
            if user_role not in roles:
                return jsonify(msg="Forbidden: insufficient role"), 403

            return fn(*args, **kwargs)
        return wrapper
    return decorator
