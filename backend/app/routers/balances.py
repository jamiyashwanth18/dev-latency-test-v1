"""Employee balance: GET /balances/mine.

Computes the current UTC year's allocation, HR adjustment and approved annual
usage, auto-creating the leave_balances row the first time it is read.
"""

from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.dependencies import get_current_user, utcnow
from app.models import LeaveBalance, LeaveRequest, LeaveStatus, LeaveType, User
from app.schemas import BalanceResponse

router = APIRouter()


def _get_or_create_balance(db: Session, user: User, year: int) -> LeaveBalance:
    balance = db.scalar(
        select(LeaveBalance).where(LeaveBalance.user_id == user.id, LeaveBalance.year == year)
    )
    if balance is not None:
        return balance

    settings = get_settings()
    balance = LeaveBalance(
        user_id=user.id,
        year=year,
        allocated_days=settings.annual_leave_allocation_days,
        adjustment_days=0,
    )
    db.add(balance)
    db.commit()
    db.refresh(balance)
    return balance


def _approved_annual_days(db: Session, user: User, year: int) -> int:
    year_start = date(year, 1, 1)
    year_end = date(year, 12, 31)
    total = db.scalar(
        select(func.coalesce(func.sum(LeaveRequest.working_days), 0)).where(
            LeaveRequest.employee_id == user.id,
            LeaveRequest.leave_type == LeaveType.ANNUAL.value,
            LeaveRequest.status == LeaveStatus.APPROVED.value,
            LeaveRequest.start_date >= year_start,
            LeaveRequest.start_date <= year_end,
        )
    )
    return int(total or 0)


@router.get("/balances/mine", response_model=BalanceResponse)
def get_my_balance(
    db: Session = Depends(get_db),  # noqa: B008
    user: User = Depends(get_current_user),  # noqa: B008
) -> BalanceResponse:
    year = utcnow().year
    balance = _get_or_create_balance(db, user, year)
    approved_annual_days = _approved_annual_days(db, user, year)
    remaining_days = balance.allocated_days + balance.adjustment_days - approved_annual_days
    return BalanceResponse(
        year=year,
        allocated_days=balance.allocated_days,
        adjustment_days=balance.adjustment_days,
        approved_annual_days=approved_annual_days,
        remaining_days=remaining_days,
    )
