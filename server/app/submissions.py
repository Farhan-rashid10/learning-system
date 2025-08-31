from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt
from sqlalchemy.exc import IntegrityError
from .models import db, Assignment, Submission
from .roles import roles_required

submissions_bp = Blueprint("submissions", __name__)

# --- Submit work ---
@submissions_bp.post("/assignments/<int:assignment_id>/submit")
@roles_required("student")
def submit_work(assignment_id):
    a = Assignment.query.get_or_404(assignment_id)
    data = request.get_json() or {}
    content = data.get("content")
    if not content:
        return {"msg": "content required"}, 400

    claims = get_jwt()
    s = Submission(assignment_id=a.id, student_id=int(claims.get("sub")), content=content) 

    db.session.add(s)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return {"msg": "Already submitted"}, 400

    return {"id": s.id, "status": "submitted"}, 201


# --- List submissions ---
@submissions_bp.get("/assignments/<int:assignment_id>/submissions")
@roles_required("admin", "instructor", "student")
def list_submissions(assignment_id):
    a = Assignment.query.get_or_404(assignment_id)
    claims = get_jwt()
    role = claims.get("role")

    if role == "instructor" and a.course.instructor_id != claims.get("sub"):
        return {"msg": "Forbidden"}, 403

    q = Submission.query.filter_by(assignment_id=assignment_id)
    if role == "student":
        q = q.filter_by(student_id=claims.get("sub"))

    subs = q.all()
    return jsonify([
        {
            "id": s.id,
            "student_id": s.student_id,
            "content": s.content,
            "submitted_at": s.submitted_at.isoformat(),
            "grade": s.grade,
            "feedback": s.feedback,
        }
        for s in subs
    ])


# --- Grade submission ---
@submissions_bp.patch("/submissions/<int:submission_id>/grade")
@roles_required("admin", "instructor")
def grade_submission(submission_id):
    s = Submission.query.get_or_404(submission_id)
    claims = get_jwt()

    if claims.get("role") == "instructor" and s.assignment.course.instructor_id != int(claims.get("sub")):
        return {"msg": "Forbidden"}, 403

    data = request.get_json() or {}
    s.grade = float(data.get("grade")) if data.get("grade") is not None else s.grade
    s.feedback = data.get("feedback", s.feedback)

    db.session.commit()
    return {"id": s.id, "grade": s.grade, "feedback": s.feedback}
