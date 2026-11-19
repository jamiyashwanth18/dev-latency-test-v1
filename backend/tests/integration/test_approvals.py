"""Acceptance tests for the manager-approvals flow: the direct-report boundary on
POST /leave-requests/{id}/decision, the overlap flag on submission, and sick-leave
reason confidentiality on GET /leave-requests/pending and /leave-requests/mine.

Every test signs in over HTTP and creates its own users with a uuid4 suffix,
asserting only on rows it created, per the contract and docs/behaviour-rules.md.
No test reads or writes PostgreSQL directly except to bootstrap the one HR/Admin
this test database has no seed for.
"""

import uuid
from datetime import date, timedelta

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import Role, User


def _bootstrap_hr_admin(db_session: Session) -> User:
    user = User(
        full_name=f"Bootstrap Admin {uuid.uuid4()}", role=Role.HR_ADMIN.value, is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def _headers(client: TestClient, user: dict | User) -> dict:
    user_id = user["id"] if isinstance(user, dict) else str(user.id)
    response = client.post("/sessions", json={"user_id": user_id})
    assert response.status_code == 201
    return {"Authorization": f"Bearer {response.json()['token']}"}


def _admin_headers(client: TestClient, db_session: Session) -> dict:
    return _headers(client, _bootstrap_hr_admin(db_session))


def _create_user(
    client: TestClient,
    admin_headers: dict,
    *,
    role: str = Role.EMPLOYEE.value,
    manager_id: str | None = None,
) -> dict:
    payload: dict = {"full_name": f"Test User {uuid.uuid4()}", "role": role}
    if manager_id is not None:
        payload["manager_id"] = manager_id
    response = client.post("/admin/users", json=payload, headers=admin_headers)
    assert response.status_code == 201, response.text
    return response.json()


def _next_monday_on_or_after(d: date) -> date:
    return d + timedelta(days=(7 - d.weekday()) % 7)


def _submit(
    client: TestClient,
    headers: dict,
    *,
    start: date,
    end: date,
    leave_type: str,
    reason: str,
) -> dict:
    response = client.post(
        "/leave-requests",
        json={
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
            "leave_type": leave_type,
            "reason": reason,
        },
        headers=headers,
    )
    assert response.status_code == 201, response.text
    return response.json()


def test_ac020_manager_decision_on_non_direct_report_returns_403_and_stays_pending(
    client: TestClient, db_session: Session
) -> None:
    admin_headers = _admin_headers(client, db_session)
    own_manager = _create_user(client, admin_headers, role=Role.MANAGER.value)
    other_manager = _create_user(client, admin_headers, role=Role.MANAGER.value)
    employee = _create_user(client, admin_headers, manager_id=own_manager["id"])
    employee_headers = _headers(client, employee)

    monday = _next_monday_on_or_after(date.today() + timedelta(days=14))
    created = _submit(
        client,
        employee_headers,
        start=monday,
        end=monday,
        leave_type="annual",
        reason=f"AC-020 reason {uuid.uuid4()}",
    )

    other_manager_headers = _headers(client, other_manager)
    decision = client.post(
        f"/leave-requests/{created['id']}/decision",
        json={"decision": "approve", "comment": "nope"},
        headers=other_manager_headers,
    )
    assert decision.status_code == 403, decision.text

    mine = client.get("/leave-requests/mine", headers=employee_headers)
    assert mine.status_code == 200
    row = next(r for r in mine.json() if r["id"] == created["id"])
    assert row["status"] == "pending"


def test_ac013_overlapping_request_flagged_not_blocked_and_visible_on_mine_and_pending(
    client: TestClient, db_session: Session
) -> None:
    admin_headers = _admin_headers(client, db_session)
    manager = _create_user(client, admin_headers, role=Role.MANAGER.value)
    employee = _create_user(client, admin_headers, manager_id=manager["id"])
    employee_headers = _headers(client, employee)

    monday = _next_monday_on_or_after(date.today() + timedelta(days=21))
    tuesday = monday + timedelta(days=1)

    first = _submit(
        client,
        employee_headers,
        start=monday,
        end=tuesday,
        leave_type="annual",
        reason=f"AC-013 first {uuid.uuid4()}",
    )
    assert first["has_overlap"] is False

    second = _submit(
        client,
        employee_headers,
        start=monday,
        end=monday,
        leave_type="annual",
        reason=f"AC-013 second {uuid.uuid4()}",
    )
    assert second["has_overlap"] is True, "overlapping second request must be created, not blocked"

    mine = client.get("/leave-requests/mine", headers=employee_headers)
    assert mine.status_code == 200
    mine_row = next(r for r in mine.json() if r["id"] == second["id"])
    assert mine_row["has_overlap"] is True

    manager_headers = _headers(client, manager)
    pending = client.get("/leave-requests/pending", headers=manager_headers)
    assert pending.status_code == 200
    pending_row = next(r for r in pending.json() if r["id"] == second["id"])
    assert pending_row["has_overlap"] is True


def test_ac038_sick_reason_hidden_from_unrelated_colleague_and_manager(
    client: TestClient, db_session: Session
) -> None:
    admin_headers = _admin_headers(client, db_session)
    manager = _create_user(client, admin_headers, role=Role.MANAGER.value)
    unrelated_manager = _create_user(client, admin_headers, role=Role.MANAGER.value)
    employee = _create_user(client, admin_headers, manager_id=manager["id"])
    unrelated_colleague = _create_user(client, admin_headers, manager_id=unrelated_manager["id"])
    employee_headers = _headers(client, employee)

    sick_reason = f"AC-038 confidential reason {uuid.uuid4()}"
    monday = _next_monday_on_or_after(date.today() + timedelta(days=28))
    created = _submit(
        client,
        employee_headers,
        start=monday,
        end=monday,
        leave_type="sick",
        reason=sick_reason,
    )

    # The unrelated colleague is an employee: /leave-requests/pending is forbidden to
    # that role outright, so the reason can never leak to them that way.
    colleague_headers = _headers(client, unrelated_colleague)
    colleague_view = client.get("/leave-requests/pending", headers=colleague_headers)
    assert colleague_view.status_code == 403

    # The unrelated manager: whatever the request appears as (filtered out, or present
    # with the key nulled), the reason text itself must never be exposed to them.
    unrelated_manager_headers = _headers(client, unrelated_manager)
    unrelated_view = client.get("/leave-requests/pending", headers=unrelated_manager_headers)
    assert unrelated_view.status_code == 200
    leaked = [r for r in unrelated_view.json() if r["id"] == created["id"]]
    for row in leaked:
        assert "reason" in row
        assert row["reason"] is None

    # Sanity: the real manager does see the reason, proving it is the viewer's
    # relationship (not the data itself) that determines visibility.
    own_manager_headers = _headers(client, manager)
    own_view = client.get("/leave-requests/pending", headers=own_manager_headers)
    own_row = next(r for r in own_view.json() if r["id"] == created["id"])
    assert own_row["reason"] == sick_reason


def test_ac039_sick_reason_readable_by_employee_manager_hr_and_annual_reason_never_stripped(
    client: TestClient, db_session: Session
) -> None:
    admin_headers = _admin_headers(client, db_session)
    manager = _create_user(client, admin_headers, role=Role.MANAGER.value)
    employee = _create_user(client, admin_headers, manager_id=manager["id"])
    employee_headers = _headers(client, employee)

    sick_reason = f"AC-039 sick reason {uuid.uuid4()}"
    sick_day = _next_monday_on_or_after(date.today() + timedelta(days=35))
    sick_request = _submit(
        client,
        employee_headers,
        start=sick_day,
        end=sick_day,
        leave_type="sick",
        reason=sick_reason,
    )

    annual_reason = f"AC-039 annual reason {uuid.uuid4()}"
    annual_day = sick_day + timedelta(days=7)
    annual_request = _submit(
        client,
        employee_headers,
        start=annual_day,
        end=annual_day,
        leave_type="annual",
        reason=annual_reason,
    )

    # Employee reads their own sick reason back.
    mine = client.get("/leave-requests/mine", headers=employee_headers)
    mine_row = next(r for r in mine.json() if r["id"] == sick_request["id"])
    assert mine_row["reason"] == sick_reason

    # The current manager reads the sick reason via /pending.
    manager_headers = _headers(client, manager)
    pending = client.get("/leave-requests/pending", headers=manager_headers)
    manager_row = next(r for r in pending.json() if r["id"] == sick_request["id"])
    assert manager_row["reason"] == sick_reason

    # HR/Admin reads the sick reason via /pending too.
    hr_view = client.get("/leave-requests/pending", headers=admin_headers)
    hr_row = next(r for r in hr_view.json() if r["id"] == sick_request["id"])
    assert hr_row["reason"] == sick_reason

    # The annual reason is never stripped, for any of the same three viewers.
    annual_mine_row = next(r for r in mine.json() if r["id"] == annual_request["id"])
    assert annual_mine_row["reason"] == annual_reason
    annual_manager_row = next(r for r in pending.json() if r["id"] == annual_request["id"])
    assert annual_manager_row["reason"] == annual_reason
    annual_hr_row = next(r for r in hr_view.json() if r["id"] == annual_request["id"])
    assert annual_hr_row["reason"] == annual_reason


def test_annual_over_balance_returns_409_naming_remaining_balance_sick_approves_fine(
    client: TestClient, db_session: Session
) -> None:
    admin_headers = _admin_headers(client, db_session)
    manager = _create_user(client, admin_headers, role=Role.MANAGER.value)
    employee = _create_user(client, admin_headers, manager_id=manager["id"])
    employee_headers = _headers(client, employee)
    manager_headers = _headers(client, manager)

    balance = client.get("/balances/mine", headers=employee_headers)
    assert balance.status_code == 200
    year = balance.json()["year"]

    adjust = client.put(
        f"/admin/users/{employee['id']}/balance",
        json={"year": year, "new_remaining_days": 1, "note": "test setup: shrink balance"},
        headers=admin_headers,
    )
    assert adjust.status_code == 200, adjust.text

    monday = _next_monday_on_or_after(date.today() + timedelta(days=42))
    tuesday = monday + timedelta(days=1)

    annual_over = _submit(
        client,
        employee_headers,
        start=monday,
        end=tuesday,
        leave_type="annual",
        reason=f"over-balance annual {uuid.uuid4()}",
    )
    decision = client.post(
        f"/leave-requests/{annual_over['id']}/decision",
        json={"decision": "approve", "comment": "trying anyway"},
        headers=manager_headers,
    )
    assert decision.status_code == 409, decision.text
    assert "1" in decision.text

    sick_over = _submit(
        client,
        employee_headers,
        start=monday,
        end=tuesday,
        leave_type="sick",
        reason=f"over-balance sick {uuid.uuid4()}",
    )
    sick_decision = client.post(
        f"/leave-requests/{sick_over['id']}/decision",
        json={"decision": "approve", "comment": "sick is never blocked by balance"},
        headers=manager_headers,
    )
    assert sick_decision.status_code == 200, sick_decision.text
    assert sick_decision.json()["status"] == "approved"
