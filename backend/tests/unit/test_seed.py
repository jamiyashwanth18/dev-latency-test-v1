"""The startup seeding of the platform's two accounts.

Credentials here are generated at run time and never written down: the test only
cares that a configured pair creates exactly one user, once.
"""

import secrets
from collections.abc import Iterator

import pytest
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models import Role, User
from app.seed import seed_platform_users

PLATFORM_VARS = (
    "BOOTSTRAP_ADMIN_EMAIL",
    "BOOTSTRAP_ADMIN_PASSWORD",
    "SMOKE_TEST_EMAIL",
    "SMOKE_TEST_PASSWORD",
)


@pytest.fixture
def clean_settings(monkeypatch: pytest.MonkeyPatch) -> Iterator[None]:
    """Settings read fresh for this test, and reset for the next one."""
    for name in PLATFORM_VARS:
        monkeypatch.delenv(name, raising=False)
    get_settings.cache_clear()
    try:
        yield
    finally:
        get_settings.cache_clear()


def _generated_email(prefix: str) -> str:
    return f"{prefix}.{secrets.token_hex(4)}@example.test"


def _user_count(session: Session) -> int:
    # A count, not "the table is empty": the suite runs against the project's own
    # database, where the platform's own startup may already have seeded its users.
    return session.scalar(select(func.count()).select_from(User)) or 0


def test_seeds_nothing_when_the_platform_set_nothing(
    db_session: Session, clean_settings: None
) -> None:
    before = _user_count(db_session)

    assert seed_platform_users(db_session) == []
    assert _user_count(db_session) == before


def test_seeds_the_admin_and_the_smoke_user_with_their_roles(
    db_session: Session, clean_settings: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    admin_email = _generated_email("admin")
    smoke_email = _generated_email("smoke")
    monkeypatch.setenv("BOOTSTRAP_ADMIN_EMAIL", admin_email)
    monkeypatch.setenv("BOOTSTRAP_ADMIN_PASSWORD", secrets.token_urlsafe(16))
    monkeypatch.setenv("SMOKE_TEST_EMAIL", smoke_email)
    monkeypatch.setenv("SMOKE_TEST_PASSWORD", secrets.token_urlsafe(16))
    get_settings.cache_clear()

    created = seed_platform_users(db_session)

    assert sorted(created) == sorted([admin_email, smoke_email])
    admin = db_session.scalar(select(User).where(User.email == admin_email))
    smoke = db_session.scalar(select(User).where(User.email == smoke_email))
    # The highest role for the bootstrap admin, the lowest for the smoke-test user.
    assert admin is not None and admin.role == Role.HR_ADMIN.value and admin.is_active
    assert smoke is not None and smoke.role == Role.EMPLOYEE.value and smoke.is_active
    assert admin.full_name


def test_seeding_twice_creates_nothing_the_second_time(
    db_session: Session, clean_settings: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    admin_email = _generated_email("admin")
    monkeypatch.setenv("BOOTSTRAP_ADMIN_EMAIL", admin_email)
    monkeypatch.setenv("BOOTSTRAP_ADMIN_PASSWORD", secrets.token_urlsafe(16))
    get_settings.cache_clear()

    assert seed_platform_users(db_session) == [admin_email]
    assert seed_platform_users(db_session) == []
    assert len(db_session.scalars(select(User).where(User.email == admin_email)).all()) == 1


def test_a_half_configured_pair_seeds_nothing(
    db_session: Session, clean_settings: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("BOOTSTRAP_ADMIN_EMAIL", _generated_email("admin"))
    get_settings.cache_clear()
    before = _user_count(db_session)

    assert seed_platform_users(db_session) == []
    assert _user_count(db_session) == before
