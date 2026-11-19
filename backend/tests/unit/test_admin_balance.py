"""PUT /admin/users/{id}/balance: the HR balance-adjustment endpoint.

Every test creates its own users with a uuid4 suffix and asserts only on rows it
created, since the suite shares one database and never truncates between tests.
"""

import uuid

from fastapi.testclient import TestClient
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import AuditLogEntry, Role, User


def _bootstrap_hr_admin(db_session: Session) -> User:
    user = User(
        full_name=f"Bootstrap Admin {uuid.uuid4()}", role=Role.HR_ADMIN.value, is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def _token_for_id(client: TestClient, user_id: str) -> str:
    response = client.post("/sessions", json={"user_id": user_id})
    assert response.status_code == 201
    return response.json()["token"]


def _hr_admin_headers(client: TestClient, db_session: Session) -> dict:
    admin = _bootstrap_hr_admin(db_session)
    return {"Authorization": f"Bearer {_token_for_id(client, str(admin.id))}"}


def _create_user(
    client: TestClient,
    admin_headers: dict,
    *,
    role: str = Role.EMPLOYEE.value,
) -> dict:
    payload = {"full_name": f"Test User {uuid.uuid4()}", "role": role}
    response = client.post("/admin/users", json=payload, headers=admin_headers)
    assert response.status_code == 201, response.text
    return response.json()


def test_ac016_put_balance_sets_remaining_days_and_leaves_allocated_days_unchanged(
    client: TestClient, db_session: Session
) -> None:
    headers = _hr_admin_headers(client, db_session)
    employee = _create_user(client, headers)
    employee_headers = {"Authorization": f"Bearer {_token_for_id(client, employee['id'])}"}

    before = client.get("/balances/mine", headers=employee_headers)
    assert before.status_code == 200
    year = before.json()["year"]
    assert before.json()["allocated_days"] == 20

    response = client.put(
        f"/admin/users/{employee['id']}/balance",
        json={"year": year, "new_remaining_days": 25, "note": "carried over"},
        headers=headers,
    )

    assert response.status_code == 200, response.text
    body = response.json()
    assert body["remaining_days"] == 25
    assert body["allocated_days"] == 20
    assert body["year"] == year

    after = client.get("/balances/mine", headers=employee_headers)
    assert after.json()["remaining_days"] == 25
    assert after.json()["allocated_days"] == 20


def test_put_balance_writes_exactly_one_audit_log_row(
    client: TestClient, db_session: Session
) -> None:
    headers = _hr_admin_headers(client, db_session)
    employee = _create_user(client, headers)
    before_count = db_session.scalar(select(func.count()).select_from(AuditLogEntry))

    response = client.put(
        f"/admin/users/{employee['id']}/balance",
        json={"year": 2026, "new_remaining_days": 10, "note": "audit test"},
        headers=headers,
    )
    assert response.status_code == 200, response.text

    after_count = db_session.scalar(select(func.count()).select_from(AuditLogEntry))
    assert after_count == before_count + 1


def test_put_balance_requires_non_empty_note_returns_422(
    client: TestClient, db_session: Session
) -> None:
    headers = _hr_admin_headers(client, db_session)
    employee = _create_user(client, headers)

    response = client.put(
        f"/admin/users/{employee['id']}/balance",
        json={"year": 2026, "new_remaining_days": 10, "note": "   "},
        headers=headers,
    )

    assert response.status_code == 422


def test_put_balance_non_hr_admin_caller_gets_403(client: TestClient, db_session: Session) -> None:
    admin_headers = _hr_admin_headers(client, db_session)
    manager = _create_user(client, admin_headers, role=Role.MANAGER.value)
    employee = _create_user(client, admin_headers)
    manager_headers = {"Authorization": f"Bearer {_token_for_id(client, manager['id'])}"}

    response = client.put(
        f"/admin/users/{employee['id']}/balance",
        json={"year": 2026, "new_remaining_days": 10, "note": "not allowed"},
        headers=manager_headers,
    )

    assert response.status_code == 403


def test_put_balance_malformed_id_returns_404(client: TestClient, db_session: Session) -> None:
    headers = _hr_admin_headers(client, db_session)

    response = client.put(
        "/admin/users/not-a-uuid/balance",
        json={"year": 2026, "new_remaining_days": 10, "note": "note"},
        headers=headers,
    )

    assert response.status_code == 404


def test_put_balance_unknown_id_returns_404(client: TestClient, db_session: Session) -> None:
    headers = _hr_admin_headers(client, db_session)

    response = client.put(
        f"/admin/users/{uuid.uuid4()}/balance",
        json={"year": 2026, "new_remaining_days": 10, "note": "note"},
        headers=headers,
    )

    assert response.status_code == 404
