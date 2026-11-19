"""Engine, session factory, the request-scoped session dependency and the
migration runner.

`DATABASE_URL` names the database (PostgreSQL once deployed, see ENVIRONMENT.md).
It falls back to a local SQLite file so a fresh clone -- and the local E2E run --
starts with no database server to stand up. The schema is only ever changed by the
Alembic migrations in `backend/migrations`, never by `create_all` outside tests.
"""

from collections.abc import Iterator
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_settings

DATABASE_URL = get_settings().database_url

# SQLite rejects a connection made on one thread and used on another, which is
# exactly what happens when FastAPI runs a sync dependency in its threadpool.
_connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=_connect_args,
    # A pooled connection a container's network dropped overnight otherwise fails
    # the first request that borrows it rather than being replaced quietly.
    pool_pre_ping=True,
    future=True,
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)

# backend/ -- where alembic.ini and migrations/ live, in the repository and in the image.
BACKEND_ROOT = Path(__file__).resolve().parents[1]


class Base(DeclarativeBase):
    """Declarative base that every model inherits."""


def get_db() -> Iterator[Session]:
    """One session per request, closed even when the handler raises."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def run_migrations() -> None:
    """Bring the database up to the latest revision.

    Called from the application's lifespan, so a container that starts owns a schema
    that matches its code. Alembic is imported here rather than at module import, so
    importing the app for a unit test never pulls the migration machinery in.
    """
    from alembic import command
    from alembic.config import Config

    # Read fresh rather than the module-level DATABASE_URL: tests reload settings
    # (get_settings.cache_clear()) after this module is imported, and this function
    # must target whatever database is configured now, not at import time.
    database_url = get_settings().database_url

    config = Config(str(BACKEND_ROOT / "alembic.ini"))
    config.set_main_option("script_location", str(BACKEND_ROOT / "migrations"))
    config.set_main_option("sqlalchemy.url", database_url.replace("%", "%%"))
    command.upgrade(config, "head")
