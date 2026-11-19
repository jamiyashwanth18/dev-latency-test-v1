"""SQLAlchemy models, one per entity in the approved data model.

Column types are the dialect-neutral SQLAlchemy ones so the same models run on
PostgreSQL (the deployed database) and on SQLite (a local run with no server):
`Uuid` becomes `uuid` on PostgreSQL and `CHAR(32)` elsewhere, and the audit
log's `detail` becomes `jsonb` on PostgreSQL and `JSON` elsewhere.

The schema itself is owned by the Alembic migrations in `backend/migrations`:
change a model here and add a migration in the same ticket.
"""

import uuid
from datetime import date, datetime
from enum import StrEnum

from sqlalchemy import (
    JSON,
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    Uuid,
    func,
)
from sqlalchemy import false as sa_false
from sqlalchemy import text as sa_text
from sqlalchemy import true as sa_true
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

# `jsonb` where the architecture asks for it, plain JSON on any other dialect.
JSONColumn = JSON().with_variant(JSONB(), "postgresql")


class Role(StrEnum):
    """Roles, lowest to highest. Stored as their value in `users.role`."""

    EMPLOYEE = "employee"
    MANAGER = "manager"
    HR_ADMIN = "hr_admin"


class LeaveType(StrEnum):
    ANNUAL = "annual"
    SICK = "sick"


class LeaveStatus(StrEnum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class NotificationType(StrEnum):
    REQUEST_SUBMITTED = "request_submitted"
    REQUEST_DECIDED = "request_decided"


def _uuid() -> uuid.UUID:
    return uuid.uuid4()


class User(Base):
    """A person: employee, manager or HR/Admin, with their reporting line."""

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=_uuid)
    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False, default=Role.EMPLOYEE.value)
    manager_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default=sa_true()
    )
    # Not in the approved entity list, and deliberately nullable: the platform seeds
    # its two accounts (BOOTSTRAP_ADMIN_EMAIL, SMOKE_TEST_EMAIL) and has to recognise
    # them again on the next startup. Users created in the app have no email -- this
    # product signs in by picking an identity, not by address.
    email: Mapped[str | None] = mapped_column(String(255), nullable=True, unique=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    manager: Mapped["User | None"] = relationship(
        "User", remote_side="User.id", back_populates="direct_reports"
    )
    direct_reports: Mapped[list["User"]] = relationship("User", back_populates="manager")

    __table_args__ = (Index("ix_users_manager_id", "manager_id"),)


class UserSession(Base):
    """An opaque bearer token: the only thing that identifies a caller.

    Named `UserSession`, not `Session`: this codebase also imports
    `sqlalchemy.orm.Session` (see app/database.py), and a model sharing that name
    would shadow it the moment both are imported in the same module.
    """

    __tablename__ = "sessions"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=_uuid)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    token: Mapped[str] = mapped_column(String(128), nullable=False, unique=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    last_active_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship("User")

    __table_args__ = (Index("ix_sessions_user_id", "user_id"),)


class LeaveRequest(Base):
    """One request for leave and, once decided, its decision."""

    __tablename__ = "leave_requests"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=_uuid)
    employee_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    leave_type: Mapped[str] = mapped_column(String(10), nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    working_days: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(
        String(10), nullable=False, default=LeaveStatus.PENDING.value
    )
    has_overlap: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default=sa_false()
    )
    manager_comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    decided_by: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    decided_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    employee: Mapped["User"] = relationship("User", foreign_keys=[employee_id])
    decider: Mapped["User | None"] = relationship("User", foreign_keys=[decided_by])

    __table_args__ = (
        Index("ix_leave_requests_employee_id", "employee_id"),
        Index("ix_leave_requests_status", "status"),
        Index("ix_leave_requests_dates", "start_date", "end_date"),
    )


class LeaveBalance(Base):
    """A user's annual allocation for one year, plus any HR adjustment."""

    __tablename__ = "leave_balances"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=_uuid)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    allocated_days: Mapped[int] = mapped_column(Integer, nullable=False)
    adjustment_days: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, server_default=sa_text("0")
    )
    adjustment_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    user: Mapped["User"] = relationship("User")

    __table_args__ = (Index("ix_leave_balances_user_year", "user_id", "year", unique=True),)


class Notification(Base):
    """An in-app indicator for one user."""

    __tablename__ = "notifications"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=_uuid)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    type: Mapped[str] = mapped_column(String(30), nullable=False)
    leave_request_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("leave_requests.id", ondelete="CASCADE"), nullable=True
    )
    is_read: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default=sa_false()
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    user: Mapped["User"] = relationship("User")
    leave_request: Mapped["LeaveRequest | None"] = relationship("LeaveRequest")

    __table_args__ = (Index("ix_notifications_user_is_read", "user_id", "is_read"),)


class AuditLogEntry(Base):
    """Append-only: rows are inserted, never updated or deleted."""

    __tablename__ = "audit_log"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=_uuid)
    actor_user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    action_type: Mapped[str] = mapped_column(String(40), nullable=False)
    leave_request_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("leave_requests.id", ondelete="SET NULL"), nullable=True
    )
    detail: Mapped[dict] = mapped_column(JSONColumn, nullable=False, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    actor: Mapped["User"] = relationship("User")

    __table_args__ = (Index("ix_audit_log_created_at", "created_at"),)


__all__ = [
    "AuditLogEntry",
    "Base",
    "LeaveBalance",
    "LeaveRequest",
    "LeaveStatus",
    "LeaveType",
    "Notification",
    "NotificationType",
    "Role",
    "User",
    "UserSession",
]
