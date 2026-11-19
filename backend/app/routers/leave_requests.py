"""Leave-request submission, listing and decision: POST /leave-requests,
GET /leave-requests/mine, GET /leave-requests/pending,
POST /leave-requests/{id}/decision.
"""

import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, to_iso_z, utcnow
from app.leave_calc import working_days_between
from app.models import AuditLogEntry, LeaveRequest, LeaveStatus, LeaveType, Role, User
from app.routers.balances import _approved_annual_days, _get_or_create_balance, _peek_balance_fields
from app.schemas import LeaveRequestCreate, LeaveRequestDecision, LeaveRequestPublic

router = APIRouter()

_OPEN_STATUSES = (LeaveStatus.PENDING.value, LeaveStatus.APPROVED.value)


def _can_see_reason(leave_request: LeaveRequest, viewer: User) -> bool:
    if viewer.role == Role.HR_ADMIN.value:
        return True
    if viewer.id == leave_request.employee_id:
        return True
    employee = leave_request.employee
    return employee is not None and employee.manager_id == viewer.id


def _remaining_balance(db: Session, employee: User) -> int:
    """Same rule as GET /balances/mine, for whichever employee owns the request.

    Persists the balance row on first read: used only where the request being
    served is itself a write (submission, decision), so one auto-create is an
    acceptable, expected side effect of that write.
    """
    year = utcnow().year
    balance = _get_or_create_balance(db, employee, year)
    approved_annual_days = _approved_annual_days(db, employee, year)
    return balance.allocated_days + balance.adjustment_days - approved_annual_days


def _remaining_balance_readonly(db: Session, employee: User, cache: dict) -> int:
    """Same rule, but a pure read: never creates a leave_balances row.

    Used by the list endpoints, which must not write as a side effect of a GET,
    and caches by (employee_id, year) so listing N rows for the same few
    employees costs a handful of queries, not up to 2N.
    """
    year = utcnow().year
    key = (employee.id, year)
    if key in cache:
        return cache[key]
    allocated_days, adjustment_days = _peek_balance_fields(db, employee, year)
    approved_annual_days = _approved_annual_days(db, employee, year)
    remaining = allocated_days + adjustment_days - approved_annual_days
    cache[key] = remaining
    return remaining


def _serialize(
    leave_request: LeaveRequest,
    *,
    viewer: User,
    db: Session,
    balance_cache: dict | None = None,
) -> LeaveRequestPublic:
    reason = leave_request.reason
    if leave_request.leave_type == LeaveType.SICK.value and not _can_see_reason(
        leave_request, viewer
    ):
        reason = None
    if balance_cache is not None:
        remaining_balance = _remaining_balance_readonly(db, leave_request.employee, balance_cache)
    else:
        remaining_balance = _remaining_balance(db, leave_request.employee)
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
        remaining_balance=remaining_balance,
        manager_comment=leave_request.manager_comment,
        decided_by=str(leave_request.decided_by) if leave_request.decided_by else None,
        decided_at=to_iso_z(leave_request.decided_at) if leave_request.decided_at else None,
        created_at=to_iso_z(leave_request.created_at),
    )


def _parse_uuid_or_404(value: str) -> uuid.UUID:
    try:
        return uuid.UUID(value)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail="Leave request not found") from exc


@router.post(
    "/leave-requests", status_code=status.HTTP_201_CREATED, response_model=LeaveRequestPublic
)
def create_leave_request(
    payload: LeaveRequestCreate,
    db: Session = Depends(get_db),  # noqa: B008
    user: User = Depends(get_current_user),  # noqa: B008
) -> LeaveRequestPublic:
    working_days = working_days_between(payload.start_date, payload.end_date)

    overlapping_request_id = db.scalar(
        select(LeaveRequest.id)
        .where(
            LeaveRequest.employee_id == user.id,
            LeaveRequest.status.in_(_OPEN_STATUSES),
            LeaveRequest.start_date <= payload.end_date,
            LeaveRequest.end_date >= payload.start_date,
        )
        .limit(1)
    )
    has_overlap = overlapping_request_id is not None

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
    return _serialize(leave_request, viewer=user, db=db)


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
    balance_cache: dict = {}
    return [_serialize(r, viewer=user, db=db, balance_cache=balance_cache) for r in rows]


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
    balance_cache: dict = {}
    return [_serialize(r, viewer=user, db=db, balance_cache=balance_cache) for r in rows]


@router.post("/leave-requests/{id}/decision", response_model=LeaveRequestPublic)
def decide_leave_request(
    id: str,
    payload: LeaveRequestDecision,
    db: Session = Depends(get_db),  # noqa: B008
    user: User = Depends(get_current_user),  # noqa: B008
) -> LeaveRequestPublic:
    request_id = _parse_uuid_or_404(id)
    leave_request = db.get(LeaveRequest, request_id)
    if leave_request is None:
        raise HTTPException(status_code=404, detail="Leave request not found")

    employee = leave_request.employee
    if employee is None or employee.manager_id != user.id:
        raise HTTPException(
            status_code=403, detail="Only the employee's current manager may decide"
        )

    if leave_request.status != LeaveStatus.PENDING.value:
        raise HTTPException(status_code=409, detail="Leave request is not pending")

    if payload.decision == "approve" and leave_request.leave_type == LeaveType.ANNUAL.value:
        remaining = _remaining_balance(db, employee)
        if leave_request.working_days > remaining:
            raise HTTPException(
                status_code=409,
                detail=(
                    "Approving this request would exceed the remaining "
                    f"balance of {remaining} days"
                ),
            )

    new_status = (
        LeaveStatus.APPROVED.value if payload.decision == "approve" else LeaveStatus.REJECTED.value
    )
    now = utcnow()
    leave_request.status = new_status
    leave_request.manager_comment = payload.comment
    leave_request.decided_by = user.id
    leave_request.decided_at = now

    db.add(
        AuditLogEntry(
            actor_user_id=user.id,
            action_type="leave_request_decided",
            leave_request_id=leave_request.id,
            detail={
                "decision": payload.decision,
                "comment": payload.comment,
                "status": new_status,
            },
        )
    )
    db.commit()
    db.refresh(leave_request)
    return _serialize(leave_request, viewer=user, db=db)
