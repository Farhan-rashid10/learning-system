# instructor.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .models import db, Course, User
from .roles import roles_required

instructor_bp = Blueprint("instructor", __name__)

# Get only instructor's own courses
@instructor_bp.get("/courses")
@jwt_required()
@roles_required("instructor")
def list_own_courses():
    user_id = get_jwt_identity()
    courses = Course.query.filter_by(instructor_id=user_id).all()
    return jsonify([
        {"id": c.id, "title": c.title, "description": c.description}
        for c in courses
    ])


# Update only instructor's own course
@instructor_bp.put("/courses/<int:course_id>")
@jwt_required()
@roles_required("instructor")
def update_own_course(course_id):
    user_id = get_jwt_identity()
    course = Course.query.filter_by(id=course_id, instructor_id=user_id).first()
    if not course:
        return jsonify(msg="Course not found or not yours"), 404

    data = request.get_json() or {}
    if "title" in data:
        course.title = data["title"]
    if "description" in data:
        course.description = data["description"]

    db.session.commit()
    return jsonify(msg="Course updated", id=course.id)


# (Optional) Delete only instructor's own course
@instructor_bp.delete("/courses/<int:course_id>")
@jwt_required()
@roles_required("instructor")
def delete_own_course(course_id):
    user_id = get_jwt_identity()
    course = Course.query.filter_by(id=course_id, instructor_id=user_id).first()
    if not course:
        return jsonify(msg="Course not found or not yours"), 404

    db.session.delete(course)
    db.session.commit()
    return jsonify(msg="Course deleted")
