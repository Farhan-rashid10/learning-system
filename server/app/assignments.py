from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt
from .models import db, Course, Assignment
from .roles import roles_required

assignments_bp = Blueprint("assignments", __name__)

# List assignments for a course
@assignments_bp.get("/courses/<int:course_id>/assignments")
def list_assignments(course_id):
    Course.query.get_or_404(course_id)
    items = Assignment.query.filter_by(course_id=course_id).all()
    return jsonify([
        {
            "id": a.id,
            "title": a.title,
            "description": a.description,
            "due_date": a.due_date.isoformat() if a.due_date else None,
            "points": a.points
        }
        for a in items
    ])


# Create assignment (Admin & Instructor)
@assignments_bp.post("/courses/<int:course_id>/assignments")
@roles_required("admin", "instructor")
def create_assignment(course_id):
    course = Course.query.get_or_404(course_id)
    claims = get_jwt()

    # Instructors can only add assignments to their own courses
    if claims.get("role") == "instructor" and course.instructor_id != int(claims.get("sub")):
        return jsonify(msg="Forbidden: not your course"), 403

    data = request.get_json() or {}
    a = Assignment(
        title=data.get("title"),
        description=data.get("description"),
        due_date=datetime.fromisoformat(data["due_date"]) if data.get("due_date") else None,
        points=int(data.get("points", 100)),
        course_id=course.id,
    )

    if not a.title:
        return {"msg": "title required"}, 400

    db.session.add(a)
    db.session.commit()

    return {"id": a.id, "title": a.title, "points": a.points}, 201


# Update assignment (Admin & Instructor)
@assignments_bp.patch("/courses/<int:course_id>/assignments")
@roles_required("admin", "instructor")
def update_assignment(assignment_id):
    a = Assignment.query.get_or_404(assignment_id)
    claims = get_jwt()

    if claims.get("role") == "instructor" and a.course.instructor_id != int(claims.get("sub")): 
        return {"msg": "Forbidden"}, 403

    data = request.get_json() or {}
    if "title" in data:
        a.title = data["title"]
    if "description" in data:
        a.description = data["description"]
    if "due_date" in data:
        a.due_date = datetime.fromisoformat(data["due_date"]) if data["due_date"] else None
    if "points" in data:
        a.points = int(data["points"]) if data["points"] else a.points

    db.session.commit()
    return {"id": a.id, "title": a.title, "points": a.points}


# Delete assignment (Admin & Instructor)
@assignments_bp.delete("/assignments/<int:assignment_id>")
@roles_required("admin", "instructor")
def delete_assignment(assignment_id):
    a = Assignment.query.get_or_404(assignment_id)
    claims = get_jwt()

    if claims.get("role") == "instructor" and a.course.instructor_id != int(claims.get("sub")):
        return {"msg": "Forbidden"}, 403

    db.session.delete(a)
    db.session.commit()
    return {"status": "deleted"}
