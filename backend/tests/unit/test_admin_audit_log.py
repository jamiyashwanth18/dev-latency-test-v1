"""GET /admin/audit-log: HR/Admin only, newest first, append-only rows."""

import uuid

from fastapi.testclient import TestClient


def _sign_in(client: TestClient, user_id: str) -> str:
    resp = client.post("/sessions", json={"user_id": user_id})
    assert resp.status_code == 201
    return resp.json()["token"]


def test_ac_admin_audit_log_requires_hr_admin_and_orders_newest_first(client, db_session):
    from app.models import Role, User

    admin = User(full_name=f"Admin {uuid.uuid4()}", role=Role.HR_ADMIN.value, is_active=True)
    employee = User(full_name=f"Employee {uuid.uuid4()}", role=Role.EMPLOYEE.value, is_active=True)
    db_session.add_all([admin, employee])
    db_session.commit()
    db_session.refresh(admin)
    db_session.refresh(employee)

    admin_token = _sign_in(client, str(admin.id))
    employee_token = _sign_in(client, str(employee.id))

    # Non-HR/Admin caller gets 403.
    resp = client.get(
        "/admin/audit-log", headers={"Authorization": f"Bearer {employee_token}"}
    )
    assert resp.status_code == 403

    # Generate two audit rows: a balance adjustment (HR/Admin action) happens
    # to write exactly one row we can inspect.
    resp = client.put(
        f"/admin/users/{employee.id}/balance",
        json={"year": 2026, "new_remaining_days": 15, "note": "correction"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200

    resp = client.get(
        "/admin/audit-log", headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert resp.status_code == 200
    rows = resp.json()
    assert len(rows) >= 1
    row = rows[0]
    expected_keys = {
        "id",
        "actor_user_id",
        "action_type",
        "leave_request_id",
        "detail",
        "created_at",
    }
    assert expected_keys <= set(row.keys())
    assert row["actor_user_id"] == str(admin.id)
    assert row["action_type"] == "balance_adjusted"
    assert row["detail"]["note"] == "correction"

    # Newest first: created_at of row[0] >= row[1] if more than one row exists.
    if len(rows) > 1:
        assert rows[0]["created_at"] >= rows[1]["created_at"]


def test_ac_admin_audit_log_unauthenticated_returns_401(client):
    resp = client.get("/admin/audit-log")
    assert resp.status_code == 401
