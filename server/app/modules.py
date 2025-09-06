# app/modules.py
# Final URLs (with blueprint prefix):
#   GET    /api/courses/<course_id>/modules           list modules (opt: ?with_items=1)
#   POST   /api/courses/<course_id>/modules           create module {title}
#   PATCH  /api/modules/<module_id>                   rename module {title}
#   DELETE /api/modules/<module_id>                   delete module
#   GET    /api/modules/<module_id>/items             list items
#   POST   /api/modules/<module_id>/items             create item {title, body}
#   PATCH  /api/items/<item_id>                       update item {title?, body?}
#   DELETE /api/items/<item_id>                       delete item
#
# Permissions:
#   admin: can read/write any course
#   instructor: can read/write only own courses
#   student: can read courses they’re enrolled in

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt

# IMPORTANT: import the models module (avoids circular import timing issues)
import app.models as models

modules_bp = Blueprint("modules", __name__, url_prefix="/api")


# ---------- helpers ----------
def _claims():
    c = get_jwt() or {}
    role = (c.get("role") or "").lower()
    try:
        uid = int(c.get("sub")) if c.get("sub") is not None else None
    except (TypeError, ValueError):
        uid = None
    return uid, role

def _can_read_course(uid, role, course_id: int) -> bool:
    if role == "admin":
        return True
    course = models.Course.query.get(course_id)
    if not course:
        return False
    if role == "instructor" and course.instructor_id == uid:
        return True
    if role == "student":
        return models.Enrollment.query.filter_by(
            student_id=uid, course_id=course_id
        ).first() is not None
    return False

def _can_write_course(uid, role, course_id: int) -> bool:
    if role == "admin":
        return True
    course = models.Course.query.get(course_id)
    return bool(course and role == "instructor" and course.instructor_id == uid)


# ---------- modules ----------
@modules_bp.get("/courses/<int:course_id>/modules")
@jwt_required()
def list_modules(course_id):
    uid, role = _claims()
    if not _can_read_course(uid, role, course_id):
        return jsonify(msg="Forbidden"), 403

    with_items = request.args.get("with_items") in ("1", "true", "yes")
    mods = (
        models.Module.query
        .filter_by(course_id=course_id)
        .order_by(models.Module.created_at.desc())
        .all()
    )
    return jsonify([m.to_dict(with_items=with_items) for m in mods]), 200


@modules_bp.post("/courses/<int:course_id>/modules")
@jwt_required()
def create_module(course_id):
    uid, role = _claims()
    if not _can_write_course(uid, role, course_id):
        return jsonify(msg="Forbidden"), 403

    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip()
    if not title:
        return jsonify(msg="title required"), 400

    m = models.Module(course_id=course_id, title=title)
    models.db.session.add(m)
    models.db.session.commit()
    return jsonify(m.to_dict()), 201


@modules_bp.patch("/modules/<int:module_id>")
@jwt_required()
def update_module(module_id):
    uid, role = _claims()
    m = models.Module.query.get_or_404(module_id)
    if not _can_write_course(uid, role, m.course_id):
        return jsonify(msg="Forbidden"), 403

    data = request.get_json(silent=True) or {}
    if "title" in data:
        t = (data["title"] or "").strip()
        if not t:
            return jsonify(msg="title cannot be empty"), 400
        m.title = t

    models.db.session.commit()
    return jsonify(m.to_dict()), 200


@modules_bp.delete("/modules/<int:module_id>")
@jwt_required()
def delete_module(module_id):
    uid, role = _claims()
    m = models.Module.query.get_or_404(module_id)
    if not _can_write_course(uid, role, m.course_id):
        return jsonify(msg="Forbidden"), 403

    models.db.session.delete(m)
    models.db.session.commit()
    return jsonify(status="deleted"), 200


# ---------- module items ----------
@modules_bp.get("/modules/<int:module_id>/items")
@jwt_required()
def list_items(module_id):
    uid, role = _claims()
    m = models.Module.query.get_or_404(module_id)
    if not _can_read_course(uid, role, m.course_id):
        return jsonify(msg="Forbidden"), 403

    items = (
        models.ModuleItem.query
        .filter_by(module_id=module_id)
        .order_by(models.ModuleItem.created_at.desc())
        .all()
    )
    return jsonify([i.to_dict() for i in items]), 200


@modules_bp.post("/modules/<int:module_id>/items")
@jwt_required()
def create_item(module_id):
    uid, role = _claims()
    m = models.Module.query.get_or_404(module_id)
    if not _can_write_course(uid, role, m.course_id):
        return jsonify(msg="Forbidden"), 403

    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip()
    body = (data.get("body") or "").strip()
    if not title:
        return jsonify(msg="title required"), 400

    it = models.ModuleItem(module_id=module_id, title=title, body=body)
    models.db.session.add(it)
    models.db.session.commit()
    return jsonify(it.to_dict()), 201


@modules_bp.patch("/items/<int:item_id>")
@jwt_required()
def update_item(item_id):
    uid, role = _claims()
    it = models.ModuleItem.query.get_or_404(item_id)
    if not _can_write_course(uid, role, it.module.course_id):
        return jsonify(msg="Forbidden"), 403

    data = request.get_json(silent=True) or {}
    if "title" in data:
        t = (data["title"] or "").strip()
        if not t:
            return jsonify(msg="title cannot be empty"), 400
        it.title = t
    if "body" in data:
        it.body = (data["body"] or "")

    models.db.session.commit()
    return jsonify(it.to_dict()), 200


@modules_bp.delete("/items/<int:item_id>")
@jwt_required()
def delete_item(item_id):
    uid, role = _claims()
    it = models.ModuleItem.query.get_or_404(item_id)
    if not _can_write_course(uid, role, it.module.course_id):
        return jsonify(msg="Forbidden"), 403

    models.db.session.delete(it)
    models.db.session.commit()
    return jsonify(status="deleted"), 200
