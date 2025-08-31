from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt
from .models import db, Course, Enrollment
from .roles import roles_required

courses_bp = Blueprint("courses", __name__)

# -------------------------------------------------------------------
# List courses  (GET /api/courses or /api/courses/)
# strict_slashes=False prevents 308 redirects during CORS preflight.
# -------------------------------------------------------------------
@courses_bp.route("/", methods=["GET"], strict_slashes=False)
def list_courses():
    courses = Course.query.all()
    return jsonify([
        {
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "instructor_id": c.instructor_id,
        }
        for c in courses
    ])

# -------------------------------------------------------------------
# Create a new course (Admin & Instructor only)
# Instructors are forced to create courses under their own user.
# -------------------------------------------------------------------
@courses_bp.route("/", methods=["POST"], strict_slashes=False)
@roles_required("admin", "instructor")
def create_course():
    data = request.get_json() or {}
    title = data.get("title")
    description = data.get("description")
    claims = get_jwt()

    # Admin may provide instructor_id; instructor is forced to self.
    instructor_id = data.get("instructor_id")
    if claims.get("role") == "instructor":
        instructor_id = int(claims.get("sub"))  # cast sub (string) -> int

    if not title:
        return jsonify(msg="title required"), 400
    if not instructor_id:
        return jsonify(msg="instructor_id required"), 400

    c = Course(title=title, description=description, instructor_id=int(instructor_id))
    db.session.add(c)
    db.session.commit()

    return jsonify(
        id=c.id,
        title=c.title,
        description=c.description,
        instructor_id=c.instructor_id,
    ), 201

# -------------------------------------------------------------------
# Get a course by ID
# -------------------------------------------------------------------
@courses_bp.get("/<int:course_id>")
def get_course(course_id):
    c = Course.query.get_or_404(course_id)
    return jsonify(
        id=c.id,
        title=c.title,
        description=c.description,
        instructor_id=c.instructor_id,
    )

# -------------------------------------------------------------------
# Update a course (Admin & Instructor only)
# Instructors can only update their own courses.
# -------------------------------------------------------------------
@courses_bp.patch("/<int:course_id>")
@roles_required("admin", "instructor")
def update_course(course_id):
    c = Course.query.get_or_404(course_id)
    claims = get_jwt()

    if claims.get("role") == "instructor" and c.instructor_id != int(claims.get("sub")):
        return jsonify(msg="Forbidden: not your course"), 403

    data = request.get_json() or {}
    if "title" in data:
        c.title = data["title"]
    if "description" in data:
        c.description = data["description"]

    db.session.commit()
    return jsonify(
        id=c.id,
        title=c.title,
        description=c.description,
        instructor_id=c.instructor_id,
    )

# -------------------------------------------------------------------
# Delete a course (Admin & Instructor only)
# Instructors can only delete their own courses.
# -------------------------------------------------------------------
@courses_bp.delete("/<int:course_id>")
@roles_required("admin", "instructor")
def delete_course(course_id):
    c = Course.query.get_or_404(course_id)
    claims = get_jwt()

    if claims.get("role") == "instructor" and c.instructor_id != int(claims.get("sub")):
        return jsonify(msg="Forbidden: not your course"), 403

    db.session.delete(c)
    db.session.commit()
    return {"status": "deleted"}

# -------------------------------------------------------------------
# Enroll student in a course
# -------------------------------------------------------------------
@courses_bp.post("/<int:course_id>/enroll")
@roles_required("student")
def enroll(course_id):
    # Ensure course exists
    Course.query.get_or_404(course_id)

    claims = get_jwt()
    e = Enrollment(student_id=int(claims.get("sub")), course_id=course_id)
    db.session.add(e)

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return {"msg": "Already enrolled or invalid"}, 400

    return {"status": "enrolled"}, 201
