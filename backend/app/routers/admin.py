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
from app.models import AuditLogEntry, Role, User, UserSession
from app.routers.balances import _approved_annual_days, _get_or_create_balance
from app.schemas import (
    AdminBalanceAdjustment,
    AdminUserCreate,
    AdminUserPublic,
    AdminUserUpdate,
    BalanceResponse,
)

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


def _creates_cycle(db: Session, user: User, manager: User) -> bool:
    """True when making ``manager`` the manager of ``user`` closes a reporting loop.

    Walks the manager chain upward from ``manager``: if ``user`` is reached, the
    assignment would make some manager report, transitively, to their own report.
    """
    seen: set[uuid.UUID] = set()
    current: User | None = manager
    while current is not None:
        if current.id == user.id:
            return True
        if current.id in seen:
            # Already-broken chain elsewhere; not this assignment's problem to detect.
            return False
        seen.add(current.id)
        current = db.get(User, current.manager_id) if current.manager_id else None
    return False


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
            manager = db.get(User, manager_id)
            if manager is None:
                raise HTTPException(status_code=404, detail="Manager not found")
            if manager_id == user.id:
                raise HTTPException(status_code=422, detail="A user may not be their own manager")
            if _creates_cycle(db, user, manager):
                raise HTTPException(
                    status_code=422, detail="This assignment would create a reporting cycle"
                )
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


@router.put("/users/{id}/balance", response_model=BalanceResponse)
def adjust_balance(
    id: str,
    payload: AdminBalanceAdjustment,
    db: Session = Depends(get_db),  # noqa: B008
    actor: User = Depends(_require_hr_admin),  # noqa: B008
) -> BalanceResponse:
    user_id = _parse_uuid_or_404(id, detail="User not found")
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    balance = _get_or_create_balance(db, user, payload.year)
    approved_annual_days = _approved_annual_days(db, user, payload.year)
    balance.adjustment_days = (
        payload.new_remaining_days - balance.allocated_days + approved_annual_days
    )
    balance.adjustment_note = payload.note

    db.add(
        AuditLogEntry(
            actor_user_id=actor.id,
            action_type="balance_adjusted",
            detail={
                "user_id": str(user.id),
                "year": payload.year,
                "new_remaining_days": payload.new_remaining_days,
                "note": payload.note,
            },
        )
    )
    db.commit()
    db.refresh(balance)

    remaining_days = balance.allocated_days + balance.adjustment_days - approved_annual_days
    return BalanceResponse(
        year=payload.year,
        allocated_days=balance.allocated_days,
        adjustment_days=balance.adjustment_days,
        approved_annual_days=approved_annual_days,
        remaining_days=remaining_days,
    )
