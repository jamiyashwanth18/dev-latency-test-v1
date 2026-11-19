"""Test fixtures: an empty database per test, never the application's own session.

The sandbox and the deployment both run PostgreSQL, so the suite uses the real
database `DATABASE_URL` names -- no SQLite stand-in, no mocks, so a query that only
works on SQLite fails here rather than in production. The schema is built by the
same Alembic migrations the application runs on startup, so the tests and a
deployed container never disagree about what a table looks like. With
`DATABASE_URL` unset (a bare clone with no server) it falls back to an in-memory
SQLite database, which Alembic cannot reach from its own connection, so there the
schema is created from the models.

Each test runs inside a transaction that is rolled back afterwards, so a row one
test writes is never there for the next one and the order the tests run in cannot
decide whether they pass. The `get_db` override makes the application use that same
transaction instead of the engine `app.database` built at import.
"""

import os
from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app import models  # noqa: F401 -- imported so every table registers on Base.metadata
from app.database import Base, get_db, run_migrations
from app.main import app


@pytest.fixture(scope="session")
def engine() -> Iterator[Engine]:
    """One engine for the whole run, with the schema already in place."""
    url = os.getenv("DATABASE_URL", "")
    if url:
        # Idempotent: on a database that is already at head this does nothing.
        run_migrations()
        test_engine = create_engine(url, pool_pre_ping=True, future=True)
    else:
        test_engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
            future=True,
        )
        Base.metadata.create_all(bind=test_engine)
    try:
        yield test_engine
    finally:
        test_engine.dispose()


@pytest.fixture
def db_session(engine: Engine) -> Iterator[Session]:
    """A session whose every write is undone when the test ends."""
    connection = engine.connect()
    transaction = connection.begin()
    # Bound to the open connection, so a commit inside the application code under
    # test lands in a savepoint that the rollback below still undoes.
    session = sessionmaker(bind=connection, autoflush=False, expire_on_commit=False)()
    try:
        yield session
    finally:
        session.close()
        if transaction.is_active:
            transaction.rollback()
        connection.close()


@pytest.fixture
def client(db_session: Session) -> Iterator[TestClient]:
    """The application, talking to this test's transaction and nothing else."""

    def _get_db() -> Iterator[Session]:
        yield db_session

    app.dependency_overrides[get_db] = _get_db
    try:
        yield TestClient(app)
    finally:
        app.dependency_overrides.clear()
