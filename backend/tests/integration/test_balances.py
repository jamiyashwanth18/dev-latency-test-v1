"""Acceptance tests for the employee balance rules: GET /balances/mine, the
approve-with-decision path via POST /leave-requests/{id}/decision, and the HR
balance adjustment via PUT /admin/users/{id}/balance.

Every test signs in over HTTP and creates its own users with a uuid4 suffix,
asserting only on rows it created, per the contract and docs/behaviour-rules.md.
No test reads or writes PostgreSQL directly.
"""

import uuid
from datetime import UTC, date, datetime, timedelta

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import Role, User


def _bootstrap_hr_admin(db_session: Session) -> User:
    """The one user this file cannot create through the API: POST /admin/users
    itself needs an HR/Admin bearer already, and this test database has none
    seeded (BOOTSTRAP_ADMIN_EMAIL is unset here)."""
    user = User(
        full_name=f"Bootstrap Admin {uuid.uuid4()}", role=Role.HR_ADMIN.value, is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def _headers(client: TestClient, user: User | dict) -> dict:
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


def _current_utc_year() -> int:
    return datetime.now(UTC).year


def test_ac017_approved_sick_leave_leaves_remaining_days_unchanged(
    client: TestClient, db_session: Session
) -> None:
    admin_headers = _admin_headers(client, db_session)
    manager = _create_user(client, admin_headers, role=Role.MANAGER.value)
    employee = _create_user(client, admin_headers, manager_id=manager["id"])
    employee_headers = _headers(client, employee)

    year = _current_utc_year()
    monday = _next_monday_on_or_after(date(year, 1, 5))

    before = client.get("/balances/mine", headers=employee_headers)
    assert before.status_code == 200, before.text
    assert before.json()["remaining_days"] == 20

    submitted = client.post(
        "/leave-requests",
        json={
            "start_date": monday.isoformat(),
            "end_date": monday.isoformat(),
            "leave_type": "sick",
            "reason": "flu",
        },
        headers=employee_headers,
    )
    assert submitted.status_code == 201, submitted.text
    request_id = submitted.json()["id"]

    manager_headers = _headers(client, manager)
    decision = client.post(
        f"/leave-requests/{request_id}/decision",
        json={"decision": "approve", "comment": "get well soon"},
        headers=manager_headers,
    )
    assert decision.status_code == 200, decision.text

    after = client.get("/balances/mine", headers=employee_headers)
    assert after.status_code == 200, after.text
    assert after.json()["remaining_days"] == 20


def test_ac018_prior_year_annual_approval_does_not_reduce_current_years_remaining_days(
    client: TestClient, db_session: Session
) -> None:
    admin_headers = _admin_headers(client, db_session)
    manager = _create_user(client, admin_headers, role=Role.MANAGER.value)
    employee = _create_user(client, admin_headers, manager_id=manager["id"])
    employee_headers = _headers(client, employee)

    current_year = _current_utc_year()
    prior_year = current_year - 1
    monday = _next_monday_on_or_after(date(prior_year, 6, 1))
    # Keep it inside the prior year so the request's start_date (and therefore the
    # year it counts against, per docs/behaviour-rules.md) stays in prior_year.
    assert monday.year == prior_year

    submitted = client.post(
        "/leave-requests",
        json={
            "start_date": monday.isoformat(),
            "end_date": monday.isoformat(),
            "leave_type": "annual",
            "reason": "old trip",
        },
        headers=employee_headers,
    )
    assert submitted.status_code == 201, submitted.text
    request_id = submitted.json()["id"]

    manager_headers = _headers(client, manager)
    decision = client.post(
        f"/leave-requests/{request_id}/decision",
        json={"decision": "approve", "comment": "approved"},
        headers=manager_headers,
    )
    assert decision.status_code == 200, decision.text

    current = client.get("/balances/mine", headers=employee_headers)
    assert current.status_code == 200, current.text
    body = current.json()
    assert body["year"] == current_year
    assert body["remaining_days"] == 20


def test_balances_mine_honours_an_hr_adjustment_made_via_put_admin_users_id_balance(
    client: TestClient, db_session: Session
) -> None:
    admin_headers = _admin_headers(client, db_session)
    employee = _create_user(client, admin_headers)
    employee_headers = _headers(client, employee)

    before = client.get("/balances/mine", headers=employee_headers)
    assert before.status_code == 200, before.text
    year = before.json()["year"]
    assert before.json()["remaining_days"] == 20

    adjust = client.put(
        f"/admin/users/{employee['id']}/balance",
        json={"year": year, "new_remaining_days": 25, "note": "carried over from last year"},
        headers=admin_headers,
    )
    assert adjust.status_code == 200, adjust.text

    after = client.get("/balances/mine", headers=employee_headers)
    assert after.status_code == 200, after.text
    assert after.json()["remaining_days"] == 25
    assert after.json()["year"] == year
