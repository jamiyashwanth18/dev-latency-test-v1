# Developer Guide

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start status -->
_Up to date._
<!-- sdlc:auto:end status -->

<!-- sdlc:auto:start source -->
Generated from commit `1e430eb` · model `claude-sonnet-5`
<!-- sdlc:auto:end source -->

<!-- sdlc:auto:start overview -->
This repository is a generated leave-management app for a small team (submit/approve leave requests, track a 20-day annual balance, view a team calendar), built as two separate applications in one repo. The frontend is a Vite + React 19 single-page app whose screens were approved and currently run entirely on seeded sample data, not live API calls. The backend is a FastAPI 0.115 service scaffolded from an approved architecture but with no endpoints implemented yet beyond a health check; it uses SQLAlchemy models (none defined yet) and a SQLite database by default, switchable to another database via an environment variable.
<!-- sdlc:auto:end overview -->

<!-- sdlc:auto:start prerequisites -->
- Node.js (for npm, to run the Vite/React frontend)
- Python 3.12 (matches backend/Dockerfile base image)
- pip
- Docker and Docker Compose (optional, for the Postgres service in docker-compose.yml)
<!-- sdlc:auto:end prerequisites -->

<!-- sdlc:auto:start setup -->
1. Clone the repository.
2. Frontend: cd frontend && npm install
3. Backend: cd backend && pip install -r requirements.txt
4. Optional: cd .. && docker compose up -d (starts a local Postgres 16 container on port 5432, user/db 'app')
5. If using Postgres instead of the SQLite default, set DATABASE_URL to point at it before starting the backend
6. Start the backend: cd backend && uvicorn app.main:app --reload
7. Start the frontend: cd frontend && npm run dev
<!-- sdlc:auto:end setup -->

<!-- sdlc:auto:start run -->
| Name | Command | Description |
|---|---|---|
| frontend dev | `npm run dev` | Starts the Vite dev server for the React SPA |
| frontend build | `npm run build` | Bundles the app with Vite (does not typecheck) |
| frontend preview | `npm run preview` | Serves the production build locally |
| backend run | `uvicorn app.main:app --reload` | Runs the FastAPI backend with auto-reload; creates DB tables on startup from the SQLAlchemy models |
<!-- sdlc:auto:end run -->

<!-- sdlc:auto:start structure -->
| Path | Purpose |
|---|---|
| `frontend` | React 19 + Vite SPA; approved screens running on seeded sample data |
| `frontend/src` | Application source: main.tsx entry, lib/api.ts API client seam, lib/ui.tsx and lib/icons.tsx component vocabulary, index.css brand tokens |
| `frontend/e2e` | Playwright end-to-end acceptance specs |
| `backend` | FastAPI service: app package, Dockerfile, requirements, tests |
| `backend/app` | Application code: main.py entrypoint, database.py engine/session setup, models.py SQLAlchemy models, schemas.py Pydantic models, routers/ for per-component routers |
| `backend/tests` | Pytest unit and integration tests (integration/test_health.py exercises /health) |
| `.devcontainer` | Dev container configuration |
| `.quorq` | Platform metadata (handoff.json) for the Quorq AI SDLC platform |
<!-- sdlc:auto:end structure -->

<!-- sdlc:auto:start conventions -->
- Backend: one router per architecture component that owns endpoints; every generated route starts as a stub returning the typed StubResponse schema until implemented
- Backend: Pydantic models in schemas.py, SQLAlchemy models in models.py, both built on shared bases (Base from database.py)
- Backend: database tables are created from models on app startup (lifespan), not via migrations; DATABASE_URL env var selects the database, defaulting to local SQLite
- Backend: CORS allowed origins are controlled via the ALLOWED_ORIGINS env var, defaulting to the local Vite dev server origins
- Frontend: one module per approved screen under src/screens/ (not yet present), with App.tsx as the navigation shell
- Frontend: all API calls are intended to go through the single apiFetch helper in src/lib/api.ts, which attaches a bearer token (session token or shared API secret)
- Frontend: screens currently render seeded sample data instead of calling the backend; api.ts is the documented seam for wiring real calls
<!-- sdlc:auto:end conventions -->

<!-- sdlc:auto:start testing -->
| Name | Command | Description |
|---|---|---|
| frontend unit | `npm test` | Runs Vitest component tests located beside the components they cover |
| frontend e2e | `npm run test:e2e` | Runs Playwright acceptance tests from the e2e/ folder; boots backend and frontend locally unless E2E_BASE_URL is set |
| frontend e2e browser install | `npm run test:e2e:install` | Installs the Chromium browser Playwright needs |
| frontend lint | `npm run lint` | Runs ESLint over the app |
| backend tests | `pytest` | Runs backend unit and integration tests (pythonpath set via pytest.ini) |
| backend lint | `ruff check .` | Lints the backend code with Ruff |
<!-- sdlc:auto:end testing -->

<!-- sdlc:auto:start troubleshooting -->
| Problem | Solution |
|---|---|
| Frontend dev server calls to the API fail or are blocked by the browser | Check CORS: the backend only allows http://localhost:5173 and http://127.0.0.1:5173 by default; set ALLOWED_ORIGINS to match your frontend's origin if different |
| Backend fails to connect to a database you expected it to use | The backend defaults to a local SQLite file (sqlite:///./app.db) regardless of the approved Postgres architecture; set the DATABASE_URL env var to your Postgres connection string (e.g. matching docker-compose.yml's app/<database-password>@localhost:5432/app) to use it instead |
| `npm run build` succeeds but deployment or CI fails on type errors | `npm run build` does not typecheck; run `npm run typecheck` (tsc --noEmit) separately and fix reported errors |
| `pytest` run from backend/ can't import app | pytest.ini sets pythonpath = . so `app` is importable; ensure you run pytest from the backend/ directory |
| Playwright e2e tests fail to start the backend | The webServer config expects a backend/.venv with dependencies installed; create and populate that virtualenv before running npm run test:e2e locally |
<!-- sdlc:auto:end troubleshooting -->
