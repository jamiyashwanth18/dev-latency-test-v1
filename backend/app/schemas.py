"""Pydantic request and response models.

One pair per entity in the approved data model, plus the placeholder every
generated route returns until it has been implemented.
"""

from datetime import date

from pydantic import BaseModel, Field, ValidationInfo, field_validator, model_validator

from app.leave_calc import working_days_between
from app.models import LeaveType, Role

_VALID_ROLES = {r.value for r in Role}
_VALID_LEAVE_TYPES = {t.value for t in LeaveType}


class UserPublic(BaseModel):
    """The minimal shape of a user shown to anyone: the identity picker, /me's
    embedded user, and a session's embedded user."""

    id: str
    full_name: str
    role: str


class MeResponse(BaseModel):
    id: str
    full_name: str
    role: str
    manager_id: str | None
    is_active: bool


class SessionCreateRequest(BaseModel):
    """Sign-in needs nothing but the identity being selected."""

    user_id: str = Field(min_length=1)


class SessionResponse(BaseModel):
    token: str
    user: UserPublic
    expires_at: str


class AdminUserPublic(BaseModel):
    """A user as shown to HR/Admin: full reporting-line and lifecycle detail."""

    id: str
    full_name: str
    role: str
    manager_id: str | None
    is_active: bool
    created_at: str


class AdminUserCreate(BaseModel):
    full_name: str = Field(min_length=1)
    role: str
    manager_id: str | None = None

    @field_validator("full_name")
    @classmethod
    def _non_blank_full_name(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("full_name must not be empty or whitespace")
        return v

    @field_validator("role")
    @classmethod
    def _known_role(cls, v: str) -> str:
        lowered = v.lower()
        if lowered not in _VALID_ROLES:
            raise ValueError("unknown role")
        return lowered


class AdminUserUpdate(BaseModel):
    full_name: str | None = None
    role: str | None = None
    manager_id: str | None = None
    is_active: bool | None = None

    @field_validator("full_name")
    @classmethod
    def _non_blank_full_name(cls, v: str | None) -> str:
        if v is None:
            raise ValueError("full_name must not be null")
        if not v.strip():
            raise ValueError("full_name must not be empty or whitespace")
        return v

    @field_validator("role")
    @classmethod
    def _known_role(cls, v: str | None) -> str:
        if v is None:
            raise ValueError("role must not be null")
        lowered = v.lower()
        if lowered not in _VALID_ROLES:
            raise ValueError("unknown role")
        return lowered

    @field_validator("is_active")
    @classmethod
    def _non_null_is_active(cls, v: bool | None) -> bool:
        if v is None:
            raise ValueError("is_active must not be null")
        return v


class LeaveRequestCreate(BaseModel):
    start_date: date
    end_date: date
    leave_type: str
    reason: str = Field(min_length=1)

    @field_validator("reason")
    @classmethod
    def _non_blank_reason(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("reason must not be empty or whitespace")
        return v

    @field_validator("leave_type")
    @classmethod
    def _known_leave_type(cls, v: str) -> str:
        lowered = v.lower()
        if lowered not in _VALID_LEAVE_TYPES:
            raise ValueError("unknown leave_type")
        return lowered

    @field_validator("end_date")
    @classmethod
    def _end_not_before_start(cls, v: date, info: ValidationInfo) -> date:
        start = info.data.get("start_date")
        if start is not None and v < start:
            raise ValueError("end_date must not be before start_date")
        return v

    @model_validator(mode="after")
    def _range_has_a_weekday(self) -> "LeaveRequestCreate":
        if working_days_between(self.start_date, self.end_date) == 0:
            raise ValueError("date range contains no Monday-to-Friday day")
        return self


class LeaveRequestPublic(BaseModel):
    id: str
    employee_id: str
    employee_name: str
    start_date: str
    end_date: str
    leave_type: str
    reason: str | None
    working_days: int
    status: str
    has_overlap: bool
    remaining_balance: int
    manager_comment: str | None
    decided_by: str | None
    decided_at: str | None
    created_at: str


_VALID_DECISIONS = {"approve", "reject"}


class LeaveRequestDecision(BaseModel):
    decision: str
    comment: str = Field(min_length=1)

    @field_validator("comment")
    @classmethod
    def _non_blank_comment(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("comment must not be empty or whitespace")
        return v

    @field_validator("decision")
    @classmethod
    def _known_decision(cls, v: str) -> str:
        lowered = v.lower()
        if lowered not in _VALID_DECISIONS:
            raise ValueError("unknown decision")
        return lowered


class BalanceResponse(BaseModel):
    year: int
    allocated_days: int
    adjustment_days: int
    approved_annual_days: int
    remaining_days: int
