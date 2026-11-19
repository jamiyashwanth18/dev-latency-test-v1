"""Reconcile a database stamped at 0001 with app/models.py, additively.

Adds only columns and indexes app/models.py declares that a database stamped at
0001 might be missing (for example leave_requests.has_overlap on a database
stamped before that column was modelled). Every change is guarded by an inspector
check, so running this against a database that already has everything is a no-op.
Revision 0001 is never edited.

Revision ID: 0002
Revises: 0001
Create Date: 2026-11-19
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0002"
down_revision: str | None = "0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def _existing_columns(inspector: sa.Inspector, table_name: str) -> set[str]:
    if table_name not in inspector.get_table_names():
        return set()
    return {col["name"] for col in inspector.get_columns(table_name)}


def _existing_indexes(inspector: sa.Inspector, table_name: str) -> set[str]:
    if table_name not in inspector.get_table_names():
        return set()
    return {ix["name"] for ix in inspector.get_indexes(table_name)}


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    # leave_requests
    lr_columns = _existing_columns(inspector, "leave_requests")
    if "has_overlap" not in lr_columns:
        op.add_column(
            "leave_requests",
            sa.Column("has_overlap", sa.Boolean(), nullable=False, server_default=sa.false()),
        )
    lr_indexes = _existing_indexes(inspector, "leave_requests")
    if "ix_leave_requests_employee_id" not in lr_indexes:
        op.create_index("ix_leave_requests_employee_id", "leave_requests", ["employee_id"])
    if "ix_leave_requests_status" not in lr_indexes:
        op.create_index("ix_leave_requests_status", "leave_requests", ["status"])
    if "ix_leave_requests_dates" not in lr_indexes:
        op.create_index("ix_leave_requests_dates", "leave_requests", ["start_date", "end_date"])

    # users
    users_columns = _existing_columns(inspector, "users")
    if "email" not in users_columns:
        op.add_column(
            "users", sa.Column("email", sa.String(length=255), nullable=True, unique=True)
        )
    users_indexes = _existing_indexes(inspector, "users")
    if "ix_users_manager_id" not in users_indexes:
        op.create_index("ix_users_manager_id", "users", ["manager_id"])

    # sessions
    sessions_columns = _existing_columns(inspector, "sessions")
    if "last_active_at" not in sessions_columns:
        op.add_column(
            "sessions",
            sa.Column(
                "last_active_at",
                sa.DateTime(timezone=True),
                nullable=False,
                server_default=sa.func.now(),
            ),
        )
    sessions_indexes = _existing_indexes(inspector, "sessions")
    if "ix_sessions_user_id" not in sessions_indexes:
        op.create_index("ix_sessions_user_id", "sessions", ["user_id"])

    # leave_balances
    lb_indexes = _existing_indexes(inspector, "leave_balances")
    if "ix_leave_balances_user_year" not in lb_indexes:
        op.create_index(
            "ix_leave_balances_user_year", "leave_balances", ["user_id", "year"], unique=True
        )

    # notifications
    notif_indexes = _existing_indexes(inspector, "notifications")
    if "ix_notifications_user_is_read" not in notif_indexes:
        op.create_index("ix_notifications_user_is_read", "notifications", ["user_id", "is_read"])

    # audit_log
    audit_indexes = _existing_indexes(inspector, "audit_log")
    if "ix_audit_log_created_at" not in audit_indexes:
        op.create_index("ix_audit_log_created_at", "audit_log", ["created_at"])


def downgrade() -> None:
    # Additive-only migration: nothing here to reverse beyond what 0001 owns.
    pass
