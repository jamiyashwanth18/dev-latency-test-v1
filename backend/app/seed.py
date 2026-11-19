"""Startup seeding of the two accounts the platform provides.

The platform sets BOOTSTRAP_ADMIN_EMAIL / BOOTSTRAP_ADMIN_PASSWORD and
SMOKE_TEST_EMAIL / SMOKE_TEST_PASSWORD on the deployed API. On startup the first
becomes the highest role (HR/Admin) and the second the lowest (Employee), each
created only when no user with that email exists -- so a redeploy adds nothing and
changes nothing. With the variables unset (a local run, the tests) nothing is
seeded.

This product signs in by picking an identity, so no password is stored and none is
checked; the password variables are read only to decide whether the platform has
configured the account at all. No credential is ever written to the database or to
this repository.
"""

import logging

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models import Role, User

logger = logging.getLogger(__name__)


def _display_name(email: str) -> str:
    """A readable full_name for the identity picker, derived from the address."""
    local_part = email.split("@", 1)[0]
    words = [word for word in local_part.replace(".", " ").replace("_", " ").split() if word]
    return " ".join(word.capitalize() for word in words)[:200] or email[:200]


def _ensure_user(session: Session, email: str, role: Role) -> bool:
    """Create the user for this email when it is missing. True when one was created."""
    existing = session.scalar(select(User).where(User.email == email))
    if existing is not None:
        return False
    session.add(User(email=email, full_name=_display_name(email), role=role.value, is_active=True))
    return True


def seed_platform_users(session: Session) -> list[str]:
    """Seed the bootstrap admin and the smoke-test user. Returns the emails created.

    Idempotent: safe to call on every startup, and safe when two containers start at
    once -- the unique index on users.email decides, and the loser rolls back.
    """
    settings = get_settings()
    wanted: list[tuple[str, str, Role]] = [
        (settings.bootstrap_admin_email, settings.bootstrap_admin_password, Role.HR_ADMIN),
        (settings.smoke_test_email, settings.smoke_test_password, Role.EMPLOYEE),
    ]

    created: list[str] = []
    for email, password, role in wanted:
        # Both halves must be configured: a half-set pair is a misconfiguration, not
        # an instruction to invent an account.
        if not email or not password:
            continue
        if _ensure_user(session, email, role):
            created.append(email)

    if not created:
        return []
    try:
        session.commit()
    except IntegrityError:
        # Another process won the race and created the same users. Nothing to do.
        session.rollback()
        return []
    logger.info("Seeded %d platform user(s).", len(created))
    return created
