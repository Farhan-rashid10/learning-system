# create_admin.py

from app import create_app, db
from app.models import User

app = create_app()

with app.app_context():
    # Check if admin already exists
    existing = User.query.filter_by(email="admin@example.com").first()
    if existing:
        print("Admin user already exists:", existing.id)
    else:
        u = User(name="Admin", email="admin@example.com", role="admin")
        u.set_password("admin123")  # make sure your User model has set_password()
        db.session.add(u)
        db.session.commit()
        print("Admin created with id:", u.id)

