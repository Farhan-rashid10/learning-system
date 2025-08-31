# LMS Monorepo (React + Flask + SQLAlchemy)

Production-ready Learning Management System (LMS) with a Vite + React frontend and Flask backend.

## Quick Start (Local)

### 1) Backend
```bash
cd server
python -m venv .venv && source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
flask db upgrade
flask seed
flask run -p 5000
```

### 2) Frontend
```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:5173 and login with seeded users (see console after `flask seed`).

## Docker
```bash
cp .env.example .env
docker-compose up --build
```

Services:
- API: http://localhost:5000
- Web: http://localhost:5173
- Postgres: exposed but password-protected
- pgAdmin: http://localhost:5050 (user: admin@local.test, pass: admin123)

## Makefile
Common tasks:
```bash
make setup       # install deps (frontend+backend)
make dev         # run both with hot reload (api + web)
make fmt         # format (black, isort, prettier)
make lint        # lint (flake8, eslint)
make test        # run tests
make seed        # seed demo data
```

## Notes
- JWT auth with access & refresh tokens, RBAC guards
- SQLite dev, PostgreSQL prod
- File uploads stored in `server/uploads/` locally
- REST JSON with consistent error envelopes
