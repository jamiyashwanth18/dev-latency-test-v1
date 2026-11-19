"""HR/Admin user management: GET/POST /admin/users, PATCH /admin/users/{id}.

Role is enforced here, server-side, for every route regardless of what the SPA
shows: only an HR/Admin bearer may call anything under /admin.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, to_iso_z, utcnow
from app.models import Role, User, UserSession
from app.schemas import AdminUserCreate, AdminUserPublic, AdminUserUpdate

router = APIRouter(prefix="/admin")


def _require_hr_admin(user: User = Depends(get_current_user)) -> User:  # noqa: B008
    if user.role != Role.HR_ADMIN.value:
        raise HTTPException(status_code=403, detail="HR/Admin role required")
    return user


def _serialize(user: User) -> AdminUserPublic:
    return AdminUserPublic(
        id=str(user.id),
        full_name=user.full_name,
        role=user.role,
        manager_id=str(user.manager_id) if user.manager_id else None,
        is_active=user.is_active,
        created_at=to_iso_z(user.created_at),
    )


def _parse_uuid_or_404(value: str, *, detail: str) -> uuid.UUID:
    try:
        return uuid.UUID(value)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=detail) from exc


@router.get("/users", response_model=list[AdminUserPublic])
def list_users(
    db: Session = Depends(get_db),  # noqa: B008
    _: User = Depends(_require_hr_admin),  # noqa: B008
) -> list[AdminUserPublic]:
    users = db.scalars(select(User).order_by(func.lower(User.full_name), User.id)).all()
    return [_serialize(u) for u in users]


@router.post("/users", status_code=status.HTTP_201_CREATED, response_model=AdminUserPublic)
def create_user(
    payload: AdminUserCreate,
    db: Session = Depends(get_db),  # noqa: B008
    _: User = Depends(_require_hr_admin),  # noqa: B008
) -> AdminUserPublic:
    manager_id: uuid.UUID | None = None
    if payload.manager_id is not None:
        manager_id = _parse_uuid_or_404(payload.manager_id, detail="Manager not found")
        if db.get(User, manager_id) is None:
            raise HTTPException(status_code=404, detail="Manager not found")

    user = User(
        full_name=payload.full_name,
        role=payload.role,
        manager_id=manager_id,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _serialize(user)


@router.patch("/users/{id}", response_model=AdminUserPublic)
def update_user(
    id: str,
    payload: AdminUserUpdate,
    db: Session = Depends(get_db),  # noqa: B008
    _: User = Depends(_require_hr_admin),  # noqa: B008
) -> AdminUserPublic:
    user_id = _parse_uuid_or_404(id, detail="User not found")
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    data = payload.model_dump(exclude_unset=True)

    if "manager_id" in data:
        manager_id_value = data["manager_id"]
        if manager_id_value is not None:
            manager_id = _parse_uuid_or_404(manager_id_value, detail="Manager not found")
            if db.get(User, manager_id) is None:
                raise HTTPException(status_code=404, detail="Manager not found")
            user.manager_id = manager_id
        else:
            user.manager_id = None

    if "full_name" in data:
        user.full_name = data["full_name"]

    if "role" in data:
        user.role = data["role"]

    if "is_active" in data:
        user.is_active = data["is_active"]
        if data["is_active"] is False:
            now = utcnow()
            sessions = db.scalars(
                select(UserSession).where(
                    UserSession.user_id == user.id, UserSession.revoked_at.is_(None)
                )
            ).all()
            for user_session in sessions:
                user_session.revoked_at = now

    db.commit()
    db.refresh(user)
    return _serialize(user)
