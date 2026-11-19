# Backend

FastAPI service for the leave app. All business rules and role checks live here; the
SPA shows what this API allows, it never decides it.

## Layout

| Path | What it holds |
|---|---|
| `app/config.py` | Every environment variable, read once, each with a local default |
| `app/database.py` | Engine, `get_db` session dependency, `run_migrations()` |
| `app/models.py` | SQLAlchemy models, one per entity in the approved data model |
| `app/schemas.py` | Pydantic request/response models |
| `app/routers/` | One router per group of endpoints, added as they are implemented |
| `app/seed.py` | Idempotent startup seeding of the platform's two accounts |
| `migrations/` | Alembic revisions -- the only way the schema ever changes |
| `tests/` | `unit/` and `integration/`, both against the real database |

## Environment

Connection settings for the services live in the repository's `ENVIRONMENT.md`. The
variables the application itself reads are:

| Variable | Holds | Without it |
|---|---|---|
| `DATABASE_URL` | SQLAlchemy URL of the PostgreSQL database | local SQLite file `./app.db` |
| `ALLOWED_ORIGINS` | Comma-separated origins the SPA is served from (CORS) | the Vite dev server's origins |
| `SECRET_KEY` | The shared API bearer the SPA sends. Public -- never sign anything with it | empty: no shared bearer required |
| `JWT_SECRET_KEY` | Private signing key for tokens and sessions | a value generated for that process only |
| `MEDIA_ROOT` | Writable directory that survives redeploys | `./media` |
| `BOOTSTRAP_ADMIN_EMAIL` | Email of the first admin, seeded on startup with the highest role (HR/Admin) | nothing is seeded |
| `BOOTSTRAP_ADMIN_PASSWORD` | Set by the platform alongside the email; both must be set for the admin to be seeded | nothing is seeded |
| `SMOKE_TEST_EMAIL` | Email of the ordinary user (lowest role, Employee) seeded on startup | nothing is seeded |
| `SMOKE_TEST_PASSWORD` | Set by the platform alongside it; both must be set for that user to be seeded | nothing is seeded |

Seeding is idempotent: a user is created only when none with that email exists, so a
redeploy neither duplicates nor overwrites. This product signs in by picking an
identity, so no password is stored or checked; the password variables are only read to
tell a configured account from an unconfigured one.

## Schema changes

The database schema is changed only through migrations. The application runs
`alembic upgrade head` on startup, so a container always matches its code.

```sh
# after changing app/models.py
.venv/bin/alembic revision --autogenerate -m "what changed"
.venv/bin/alembic upgrade head
```

## Running

```sh
.venv/bin/python -m uvicorn app.main:app --reload   # http://127.0.0.1:8000
.venv/bin/python -m pytest                          # the test suite
```
