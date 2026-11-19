# Developer Guide

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start status -->
_Up to date._
<!-- sdlc:auto:end status -->

<!-- sdlc:auto:start source -->
Generated from commit `8bd31fa` · model `claude-sonnet-5`
<!-- sdlc:auto:end source -->

<!-- sdlc:auto:start overview -->
This repository holds two generated applications for a small-team leave-management product: a Vite + React 19 single-page frontend (approved screens, currently running on seeded sample data) and a FastAPI backend that implements the full leave workflow (identity-pick sign-in, leave request submission, manager approval/rejection, balance tracking, and HR/Admin user management). The backend persists to PostgreSQL in production (SQLite locally as a zero-setup fallback), uses SQLAlchemy models with Alembic migrations as the only way the schema changes, and applies migrations plus idempotent account seeding automatically on startup. Role checks (employee/manager/hr_admin) are enforced entirely server-side in the FastAPI routers.
<!-- sdlc:auto:end overview -->

<!-- sdlc:auto:start prerequisites -->
- Node.js (for npm/Vite 6, React 19, TypeScript 5.6 — frontend)
- npm
- Python 3.12 (matches backend/Dockerfile base image)
- pip
- Docker and Docker Compose (optional, to run PostgreSQL 16 via docker-compose.yml)
<!-- sdlc:auto:end prerequisites -->

<!-- sdlc:auto:start setup -->
1. Clone the repository.
2. Backend: cd backend
3. Create and activate a virtual environment, e.g. python3 -m venv .venv && source .venv/bin/activate
4. Install backend dependencies: pip install -r requirements.txt
5. (Optional) Start a local PostgreSQL via Docker Compose from the repo root: docker compose up -d db
6. (Optional) Set DATABASE_URL and other variables described in backend/README.md / ENVIRONMENT.md; without DATABASE_URL the backend falls back to a local SQLite file ./app.db
7. Start the backend (migrations run automatically on startup): uvicorn app.main:app --reload
8. Frontend: in a new terminal, cd frontend
9. Install frontend dependencies: npm install
10. Start the frontend dev server: npm run dev
<!-- sdlc:auto:end setup -->

<!-- sdlc:auto:start run -->
| Name | Command | Description |
|---|---|---|
| backend dev | `uvicorn app.main:app --reload` | Runs the FastAPI service from backend/ at http://127.0.0.1:8000, applying Alembic migrations and seeding platform accounts on startup. |
| frontend dev | `npm run dev` | Starts the Vite dev server for the React SPA (run from frontend/). |
| frontend build | `npm run build` | Bundles the frontend with Vite; does not type-check (see npm run typecheck). |
| frontend preview | `npm run preview` | Serves the production build locally. |
| db (optional) | `docker compose up -d db` | Starts a local PostgreSQL 16 container defined in docker-compose.yml. |
<!-- sdlc:auto:end run -->

<!-- sdlc:auto:start structure -->
| Path | Purpose |
|---|---|
| `backend/` | FastAPI service: app code, migrations, tests, Dockerfile, requirements. |
| `backend/app/` | Application package: config, database/session setup, SQLAlchemy models, Pydantic schemas, routers, seeding, leave-day calculation. |
| `backend/app/routers/` | One router per endpoint group: sessions (identity/sign-in), admin (users/audit log/balance adjustment), leave_requests, balances. |
| `backend/migrations/` | Alembic revisions; the only way the database schema changes. Applied automatically via app.main lifespan. |
| `backend/tests/` | pytest suite split into unit/ and integration/, run against a real database. |
| `backend/scripts/` | Standalone operational scripts (e.g. check_connections.py). |
| `frontend/` | Vite + React 19 SPA: approved screens, API client, build/test/lint/e2e tooling. |
| `frontend/src/` | App source: App.tsx (nav shell/routes), main.tsx entry, lib/, screens/. |
| `frontend/src/screens/` | One module (and colocated test) per approved screen: SignIn, MyLeave, Approvals, TeamCalendar, Admin, GettingStarted. |
| `frontend/src/lib/` | Shared app code: api.ts (fetch wrapper, session token, types), ui.tsx/icons.tsx (component vocabulary), brand.ts (brand tokens). |
| `frontend/e2e/` | Playwright acceptance specs plus support/ helpers; run against a locally booted backend+frontend or a deployed URL. |
| `.github/workflows/` | CI/CD: deploy.yml builds the backend image, pushes to ECR, builds and deploys the frontend to AWS Amplify via OIDC. |
| `docs/` | Project documentation, e.g. behaviour-rules.md. |
| `.devcontainer/` | VS Code dev container configuration. |
| `.quorq/` | Quorq AI SDLC platform metadata for this project (handoff/prepared/test-fix state). |
<!-- sdlc:auto:end structure -->

<!-- sdlc:auto:start conventions -->
- Backend: one FastAPI router per architecture component, one route per declared endpoint (app/routers/*.py), included in app/main.py as they're implemented.
- Schema changes only via Alembic migrations in backend/migrations; models.py and a migration are changed together.
- SQLAlchemy models use dialect-neutral types (e.g. Uuid, JSON-with-postgresql-JSONB variant) so the same models run on PostgreSQL and the local SQLite fallback.
- Role checks (employee/manager/hr_admin) are enforced server-side inside each router, independent of what the frontend displays.
- Pydantic request/response schemas in app/schemas.py mirror app/models.py, one pair per entity.
- Platform account seeding (app/seed.py) is idempotent: a user is created only if no user with that email already exists.
- Frontend: one module per approved screen under src/screens/, each paired with a colocated *.test.tsx.
- All API access goes through the single apiFetch wrapper in src/lib/api.ts, which attaches the session bearer token and normalizes errors into ApiError.
- Frontend screens currently render seeded sample data; wiring each screen to the real backend endpoints is left as future work, not yet done.
- Playwright e2e specs live in frontend/e2e/ (separate from Vitest's src/**/*.test.tsx) and are explicitly excluded from the Vitest include pattern.
<!-- sdlc:auto:end conventions -->

<!-- sdlc:auto:start testing -->
| Name | Command | Description |
|---|---|---|
| backend unit/integration tests | `pytest` | Runs backend/tests (unit/ and integration/) against a real database; run from backend/ (pytest.ini sets pythonpath=.). |
| backend lint | `ruff check .` | Lints the backend codebase (run from backend/). |
| backend format check | `ruff format .` | Formats/checks formatting of backend code (run from backend/). |
| frontend unit tests | `npm run test` | Runs Vitest component tests colocated beside screens/components (frontend/). |
| frontend typecheck | `npm run typecheck` | Runs tsc --noEmit; not performed by npm run build, so worth running separately. |
| frontend lint | `npm run lint` | Runs ESLint over the frontend app; this is the gate the platform runs during development. |
| frontend format check | `npm run format:check` | Checks Prettier formatting without writing changes. |
| frontend e2e install | `npm run test:e2e:install` | Installs the Chromium browser Playwright needs, before the first e2e run. |
| frontend e2e tests | `npm run test:e2e` | Runs Playwright specs in frontend/e2e/; without E2E_BASE_URL it boots the backend (from backend/.venv) and builds/serves the frontend locally. |
<!-- sdlc:auto:end testing -->

<!-- sdlc:auto:start troubleshooting -->
| Problem | Solution |
|---|---|
| npm run build succeeds but the app doesn't actually typecheck cleanly. | vite build does not run TypeScript checking; run npm run typecheck (tsc --noEmit) separately and fix any reported errors before relying on types. |
| Frontend calls to the API fail in the browser with a CORS error. | Set the backend's ALLOWED_ORIGINS environment variable to include the frontend's origin (e.g. the Vite dev server URL); the backend's CORS middleware only allows origins listed there. |
| No PostgreSQL server available locally. | Leave DATABASE_URL unset; backend/app/database.py falls back to a local SQLite file ./app.db, so the backend runs with no database server to stand up. |
| `pytest` run from the repo root fails to `import app`. | Run pytest from the backend/ directory; backend/pytest.ini sets pythonpath=. relative to that directory. |
| `npm run test:e2e` fails to boot the backend. | Playwright's webServer config expects a Python virtual environment at backend/.venv with dependencies already installed (../backend/.venv/bin/python -m uvicorn ...); create and populate that venv before running e2e tests. |
| A signed-in session stops working after some idle time. | Sessions expire based on the configured session idle period; sign in again via POST /sessions (pick a user from GET /users/active) to obtain a new bearer token. |
<!-- sdlc:auto:end troubleshooting -->
