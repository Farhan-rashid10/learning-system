from flask import Blueprint, request, jsonify
from .models import db, User, Course
from .roles import roles_required
from flask_jwt_extended import jwt_required

admin_bp = Blueprint("admin", __name__)

# Create user (Admin only)
@admin_bp.post("/users")
@jwt_required()
@roles_required("admin")
def create_user():
    data = request.get_json() or {}
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "student")

    if role not in ("admin", "instructor", "student"):
        return jsonify(msg="Invalid role"), 400

    if not all([name, email, password]):
        return jsonify(msg="name, email, password required"), 400

    if User.query.filter_by(email=email).first():
        return jsonify(msg="Email already exists"), 409

    u = User(name=name, email=email, role=role)
    u.set_password(password)  # make sure User has set_password method
    db.session.add(u)
    db.session.commit()

    return jsonify(id=u.id, name=u.name, email=u.email, role=u.role), 201


# List users (Admin only)
@admin_bp.get("/users")
@jwt_required()
@roles_required("admin")
def list_users():
    users = User.query.all()
    return jsonify([
        {"id": u.id, "name": u.name, "email": u.email, "role": u.role}
        for u in users
    ])

# Delete user (Admin only)
@admin_bp.delete("/users/<int:user_id>")
@jwt_required()
@roles_required("admin")
def delete_user(user_id):
    user = User.query.get_or_404(user_id)

    # If you want to protect admin accounts from being deleted:
    if user.role == "admin":
        return jsonify(msg="Cannot delete another admin"), 403

    db.session.delete(user)
    db.session.commit()
    return jsonify(msg="User deleted", id=user.id)

# ---------------- Courses ----------------

# Create course (Admin only)
@admin_bp.post("/courses")
@jwt_required()
@roles_required("admin")
def create_course():
    data = request.get_json() or {}
    title = data.get("title")
    description = data.get("description", "")
    instructor_id = data.get("instructor_id")

    if not all([title, instructor_id]):
        return jsonify(msg="title and instructor_id required"), 400

    instructor = User.query.get(instructor_id)
    if not instructor or instructor.role != "instructor":
        return jsonify(msg="Instructor not found or not valid"), 400

    course = Course(title=title, description=description, instructor_id=instructor_id)
    db.session.add(course)
    db.session.commit()

    return jsonify(id=course.id, title=course.title, description=course.description), 201


# List courses (Admin only)
@admin_bp.get("/courses")
@jwt_required()
@roles_required("admin")
def list_courses():
    courses = Course.query.all()
    return jsonify([
        {
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "instructor": c.instructor.name if c.instructor else None
        }
        for c in courses
    ])


# Update course (Admin only)
@admin_bp.put("/courses/<int:course_id>")
@jwt_required()
@roles_required("admin")
def update_course(course_id):
    course = Course.query.get_or_404(course_id)
    data = request.get_json() or {}

    if "title" in data:
        course.title = data["title"]
    if "description" in data:
        course.description = data["description"]
    if "instructor_id" in data:
        instructor = User.query.get(data["instructor_id"])
        if not instructor or instructor.role != "instructor":
            return jsonify(msg="Invalid instructor_id"), 400
        course.instructor_id = instructor.id

    db.session.commit()
    return jsonify(msg="Course updated", id=course.id)


# Delete course (Admin only)
@admin_bp.delete("/courses/<int:course_id>")
@jwt_required()
@roles_required("admin")
def delete_course(course_id):
    course = Course.query.get_or_404(course_id)
    db.session.delete(course)
    db.session.commit()
    return jsonify(msg="Course deleted")