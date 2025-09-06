from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from . import db  # db is initialized in __init__.py

# --------------------------- User model ---------------------------
class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(50), default="student", nullable=False)

    # Relationships
    courses_taught = db.relationship("Course", back_populates="instructor")
    submissions = db.relationship("Submission", back_populates="student")

    def set_password(self, pw: str) -> None:
        """Hash and set password"""
        self.password_hash = generate_password_hash(pw)

    def check_password(self, pw: str) -> bool:
        """Check password against hash"""
        return check_password_hash(self.password_hash, pw)


# --------------------------- Course model ---------------------------
class Course(db.Model):
    __tablename__ = "courses"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    instructor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    instructor = db.relationship("User", back_populates="courses_taught")
    assignments = db.relationship("Assignment", back_populates="course", cascade="all, delete-orphan")
    enrollments = db.relationship("Enrollment", back_populates="course", cascade="all, delete-orphan")


# --------------------------- Enrollment model ---------------------------
class Enrollment(db.Model):
    __tablename__ = "enrollments"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)

    student = db.relationship("User")
    course = db.relationship("Course", back_populates="enrollments")

    __table_args__ = (
        db.UniqueConstraint("student_id", "course_id", name="uq_student_course"),
    )


# --------------------------- Assignment model ---------------------------
class Assignment(db.Model):
    __tablename__ = "assignments"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text)
    due_date = db.Column(db.DateTime)
    points = db.Column(db.Integer, default=100)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)

    course = db.relationship("Course", back_populates="assignments")
    submissions = db.relationship("Submission", back_populates="assignment", cascade="all, delete-orphan")


# --------------------------- Submission model ---------------------------
class Submission(db.Model):
    __tablename__ = "submissions"

    id = db.Column(db.Integer, primary_key=True)
    assignment_id = db.Column(db.Integer, db.ForeignKey("assignments.id"), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    content = db.Column(db.Text)  # could be text or file URL
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    grade = db.Column(db.Float)
    feedback = db.Column(db.Text)

    assignment = db.relationship("Assignment", back_populates="submissions")
    student = db.relationship("User", back_populates="submissions")

    __table_args__ = (
        db.UniqueConstraint("assignment_id", "student_id", name="uq_assignment_student"),
    )


# ======================================================================
#                        NEW: Modules feature
#   (added without changing the existing models above)
# ======================================================================

class Module(db.Model):
    __tablename__ = "modules"

    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(
        db.Integer,
        db.ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # backref exposes: course.modules (no edit to Course class code needed)
    course = db.relationship(
        "Course",
        backref=db.backref("modules", cascade="all, delete-orphan"),
    )

    items = db.relationship(
        "ModuleItem",
        back_populates="module",
        cascade="all, delete-orphan",
    )

    def to_dict(self, with_items: bool = False) -> dict:
        data = {
            "id": self.id,
            "course_id": self.course_id,
            "title": self.title,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
        if with_items:
            # newest first
            data["contents"] = [i.to_dict() for i in sorted(self.items, key=lambda x: x.created_at, reverse=True)]
        return data


class ModuleItem(db.Model):
    __tablename__ = "module_items"

    id = db.Column(db.Integer, primary_key=True)
    module_id = db.Column(
        db.Integer,
        db.ForeignKey("modules.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = db.Column(db.String(200), nullable=False)
    body = db.Column(db.Text, default="")
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    module = db.relationship("Module", back_populates="items")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "module_id": self.module_id,
            "title": self.title,
            "body": self.body or "",
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
