"""Identity selection and session lifecycle: GET /users/active, POST /sessions,
GET /me, DELETE /sessions/current.
"""

import uuid
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.dependencies import generate_token, get_current_session, get_current_user, to_iso_z, utcnow
from app.models import User, UserSession
from app.schemas import MeResponse, SessionCreateRequest, UserPublic

router = APIRouter()


@router.get("/users/active", response_model=list[UserPublic])
def list_active_users(db: Session = Depends(get_db)) -> list[UserPublic]:  # noqa: B008
    """Everyone active, for the identity picker. No auth: this is how one signs in."""
    users = db.scalars(
        select(User).where(User.is_active.is_(True)).order_by(func.lower(User.full_name), User.id)
    ).all()
    return [UserPublic(id=str(u.id), full_name=u.full_name, role=u.role) for u in users]


@router.post("/sessions", status_code=status.HTTP_201_CREATED)
def create_session(
    payload: SessionCreateRequest,
    db: Session = Depends(get_db),  # noqa: B008
) -> dict:
    try:
        user_id = uuid.UUID(payload.user_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail="User not found") from exc

    user = db.get(User, user_id)
    if user is None or not user.is_active:
        raise HTTPException(status_code=404, detail="User not found")

    settings = get_settings()
    now = utcnow()
    token = generate_token()
    # Unique across sessions: astronomically unlikely to collide, re-roll just in
    # case rather than ever surfacing a collision to the caller.
    while db.scalar(select(UserSession).where(UserSession.token == token)) is not None:
        token = generate_token()

    session = UserSession(
        user_id=user.id,
        token=token,
        created_at=now,
        last_active_at=now,
        expires_at=now + timedelta(minutes=settings.session_idle_minutes),
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return {
        "token": token,
        "user": {"id": str(user.id), "full_name": user.full_name, "role": user.role},
        "expires_at": to_iso_z(session.expires_at),
    }


@router.get("/me", response_model=MeResponse)
def get_me(user: User = Depends(get_current_user)) -> MeResponse:  # noqa: B008
    return MeResponse(
        id=str(user.id),
        full_name=user.full_name,
        role=user.role,
        manager_id=str(user.manager_id) if user.manager_id else None,
        is_active=user.is_active,
    )


@router.delete("/sessions/current", status_code=status.HTTP_204_NO_CONTENT)
def delete_current_session(
    session: UserSession = Depends(get_current_session),  # noqa: B008
    db: Session = Depends(get_db),  # noqa: B008
) -> Response:
    session.revoked_at = utcnow()
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
