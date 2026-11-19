"""Application entrypoint.

Generated from the approved architecture: one router per component that owns
endpoints, one route per endpoint the API spec declares. The routers in
`app.routers` are included here as they are written, one ticket at a time.
"""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models  # noqa: F401 -- imported so every table registers on Base.metadata
from app.config import get_settings
from app.database import SessionLocal, run_migrations
from app.routers.admin import router as admin_router
from app.routers.sessions import router as sessions_router
from app.seed import seed_platform_users

settings = get_settings()

DESCRIPTION = (
    "A web app for a small team to manage leave. Employees submit a leave request "
    "with start date, end date, type (annual, sick) and a reason, and see their own "
    "requests and remaining annual balance. Managers approve or reject pending "
    "requests from their direct reports with a comment; approved leave reduces the "
    "balance. A team calendar shows who is on leave each day. No external login: "
    "pick a user from a list."
)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Bring the schema up to date, then seed the platform's accounts.

    The schema is owned by the Alembic migrations in `backend/migrations`, so a
    container that starts always runs against the schema its code expects. This runs
    on startup and not at import, so importing the application never opens a
    connection: a test can point `get_db` at a database of its own, and a deployment
    whose `DATABASE_URL` names a server that is not up fails where you can read the
    error rather than while pytest collects the files.
    """
    run_migrations()
    session = SessionLocal()
    try:
        seed_platform_users(session)
    finally:
        session.close()
    yield


app = FastAPI(
    title="Dev latency test - v1",
    description=DESCRIPTION,
    version="0.1.0",
    lifespan=lifespan,
)

# The SPA runs on a different origin than the API, so the browser refuses its calls
# unless that origin is allowed here. In development that is the Vite dev server; when
# deployed, the platform injects the frontend's real URL as ALLOWED_ORIGINS (comma
# separated). Point ALLOWED_ORIGINS at the real thing and nothing else has to change.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict[str, str]:
    """Liveness probe, and the only route here that is not a stub."""
    return {"status": "ok"}


app.include_router(sessions_router)
app.include_router(admin_router)
