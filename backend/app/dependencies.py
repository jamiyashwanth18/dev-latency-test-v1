"""Shared request-scoped helpers: session tokens and the sliding idle window."""

import secrets
from datetime import UTC, datetime, timedelta

from fastapi import Depends, Header, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models import User, UserSession

# Opaque, random, never a JWT and never derivable from the user id. 43 base64url
# characters from 32 random bytes: comfortably inside the 32..128 range the
# contract allows and far from either edge.
_TOKEN_BYTES = 32


def generate_token() -> str:
    return secrets.token_urlsafe(_TOKEN_BYTES)


def utcnow() -> datetime:
    return datetime.now(UTC)


def to_iso_z(value: datetime) -> str:
    """Serialise a timestamp as ISO-8601 with a 'Z' suffix, always from UTC."""
    if value.tzinfo is None:
        value = value.replace(tzinfo=UTC)
    return value.astimezone(UTC).isoformat(timespec="seconds").replace("+00:00", "Z")


def _as_aware(value: datetime) -> datetime:
    return value if value.tzinfo is not None else value.replace(tzinfo=UTC)


def _unauthorized() -> HTTPException:
    return HTTPException(status_code=401, detail="Not authenticated")


def get_current_session(
    authorization: str | None = Header(default=None),  # noqa: B008
    db: Session = Depends(get_db),  # noqa: B008
) -> UserSession:
    """The caller's session, validated and slid forward on every success.

    Any missing header, non-bearer scheme, or unknown/revoked/expired/deactivated-
    user token fails closed with the same 401 body, never revealing which check
    failed.
    """
    if not authorization:
        raise _unauthorized()
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise _unauthorized()

    session = db.scalar(select(UserSession).where(UserSession.token == token))
    if session is None or session.revoked_at is not None:
        raise _unauthorized()

    now = utcnow()
    if _as_aware(session.expires_at) <= now:
        raise _unauthorized()

    user = db.get(User, session.user_id)
    if user is None or not user.is_active:
        raise _unauthorized()

    settings = get_settings()
    session.last_active_at = now
    session.expires_at = now + timedelta(minutes=settings.session_idle_minutes)
    db.commit()
    db.refresh(session)
    return session


def get_current_user(
    session: UserSession = Depends(get_current_session),  # noqa: B008
    db: Session = Depends(get_db),  # noqa: B008
) -> User:
    user = db.get(User, session.user_id)
    if user is None or not user.is_active:
        raise _unauthorized()
    return user
