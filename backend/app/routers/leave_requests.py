"""Leave-request submission and listing: POST /leave-requests,
GET /leave-requests/mine, GET /leave-requests/pending.
"""

from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, to_iso_z
from app.leave_calc import working_days_between
from app.models import AuditLogEntry, LeaveRequest, LeaveStatus, Role, User
from app.schemas import LeaveRequestCreate, LeaveRequestPublic

router = APIRouter()

_OPEN_STATUSES = (LeaveStatus.PENDING.value, LeaveStatus.APPROVED.value)


def _can_see_reason(leave_request: LeaveRequest, viewer: User) -> bool:
    if viewer.role == Role.HR_ADMIN.value:
        return True
    if viewer.id == leave_request.employee_id:
        return True
    employee = leave_request.employee
    return employee is not None and employee.manager_id == viewer.id


def _serialize(leave_request: LeaveRequest, *, viewer: User) -> LeaveRequestPublic:
    reason = leave_request.reason
    if leave_request.leave_type == "sick" and not _can_see_reason(leave_request, viewer):
        reason = None
    return LeaveRequestPublic(
        id=str(leave_request.id),
        employee_id=str(leave_request.employee_id),
        employee_name=leave_request.employee.full_name,
        start_date=leave_request.start_date.isoformat(),
        end_date=leave_request.end_date.isoformat(),
        leave_type=leave_request.leave_type,
        reason=reason,
        working_days=leave_request.working_days,
        status=leave_request.status,
        has_overlap=leave_request.has_overlap,
        manager_comment=leave_request.manager_comment,
        decided_by=str(leave_request.decided_by) if leave_request.decided_by else None,
        decided_at=to_iso_z(leave_request.decided_at) if leave_request.decided_at else None,
        created_at=to_iso_z(leave_request.created_at),
    )


@router.post(
    "/leave-requests", status_code=status.HTTP_201_CREATED, response_model=LeaveRequestPublic
)
def create_leave_request(
    payload: LeaveRequestCreate,
    db: Session = Depends(get_db),  # noqa: B008
    user: User = Depends(get_current_user),  # noqa: B008
) -> LeaveRequestPublic:
    working_days = working_days_between(payload.start_date, payload.end_date)

    overlap_count = db.scalar(
        select(LeaveRequest.id)
        .where(
            LeaveRequest.employee_id == user.id,
            LeaveRequest.status.in_(_OPEN_STATUSES),
            LeaveRequest.start_date <= payload.end_date,
            LeaveRequest.end_date >= payload.start_date,
        )
        .limit(1)
    )
    has_overlap = overlap_count is not None

    leave_request = LeaveRequest(
        employee_id=user.id,
        start_date=payload.start_date,
        end_date=payload.end_date,
        leave_type=payload.leave_type,
        reason=payload.reason,
        working_days=working_days,
        status=LeaveStatus.PENDING.value,
        has_overlap=has_overlap,
        # Set from the application clock, not the database's: tests run every
        # statement inside one still-open transaction, where Postgres `now()`
        # (and therefore the column's server_default) returns the same instant
        # for every insert, collapsing the created_at ordering this endpoint
        # promises into ties broken by random UUID order instead.
        created_at=datetime.now(UTC),
    )
    db.add(leave_request)
    db.flush()

    db.add(
        AuditLogEntry(
            actor_user_id=user.id,
            action_type="leave_request_submitted",
            leave_request_id=leave_request.id,
            detail={
                "start_date": payload.start_date.isoformat(),
                "end_date": payload.end_date.isoformat(),
                "leave_type": payload.leave_type,
                "working_days": working_days,
                "has_overlap": has_overlap,
            },
        )
    )
    db.commit()
    db.refresh(leave_request)
    return _serialize(leave_request, viewer=user)


@router.get("/leave-requests/mine", response_model=list[LeaveRequestPublic])
def list_mine(
    db: Session = Depends(get_db),  # noqa: B008
    user: User = Depends(get_current_user),  # noqa: B008
) -> list[LeaveRequestPublic]:
    rows = db.scalars(
        select(LeaveRequest)
        .where(LeaveRequest.employee_id == user.id)
        .order_by(LeaveRequest.created_at.desc(), LeaveRequest.id.desc())
    ).all()
    return [_serialize(r, viewer=user) for r in rows]


@router.get("/leave-requests/pending", response_model=list[LeaveRequestPublic])
def list_pending(
    db: Session = Depends(get_db),  # noqa: B008
    user: User = Depends(get_current_user),  # noqa: B008
) -> list[LeaveRequestPublic]:
    if user.role == Role.EMPLOYEE.value:
        raise HTTPException(status_code=403, detail="Employee role may not view pending requests")

    query = select(LeaveRequest).where(LeaveRequest.status == LeaveStatus.PENDING.value)
    if user.role != Role.HR_ADMIN.value:
        query = query.join(User, User.id == LeaveRequest.employee_id).where(
            User.manager_id == user.id
        )
    query = query.order_by(LeaveRequest.created_at.asc(), LeaveRequest.id.asc())

    rows = db.scalars(query).all()
    return [_serialize(r, viewer=user) for r in rows]
