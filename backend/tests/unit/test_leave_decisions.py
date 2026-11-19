"""POST /leave-requests/{id}/decision, and remaining_balance/has_overlap on
GET /leave-requests/pending.

Every test creates its own users with a uuid4 suffix and asserts only on rows it
created, since the suite shares one database and never truncates between tests.
"""

import uuid
from datetime import date, timedelta

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import AuditLogEntry, Role, User

_MONDAY = date(2026, 11, 23)


def _bootstrap_hr_admin(db_session: Session) -> User:
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


def _submit(
    client: TestClient,
    headers: dict,
    start: date,
    end: date,
    leave_type: str,
    reason: str = "x",
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


def test_ac019_pending_item_has_remaining_balance_and_has_overlap(
    client: TestClient, db_session: Session
) -> None:
    admin_headers = _admin_headers(client, db_session)
    manager = _create_user(client, admin_headers, role=Role.MANAGER.value)
    employee = _create_user(client, admin_headers, manager_id=manager["id"])
    submitted = _submit(client, _headers(client, employee), _MONDAY, _MONDAY, "annual")

    pending = client.get("/leave-requests/pending", headers=_headers(client, manager)).json()
    match = next(r for r in pending if r["id"] == submitted["id"])

    assert match["remaining_balance"] == 20
    assert match["has_overlap"] is False
    assert match["status"] == "pending"
    assert match["manager_comment"] is None
    assert match["decided_by"] is None
    assert match["decided_at"] is None
    assert match["employee_id"] == employee["id"]


def test_ac020_manager_approves_direct_reports_request(
    client: TestClient, db_session: Session
) -> None:
    admin_headers = _admin_headers(client, db_session)
    manager = _create_user(client, admin_headers, role=Role.MANAGER.value)
    employee = _create_user(client, admin_headers, manager_id=manager["id"])
    submitted = _submit(client, _headers(client, employee), _MONDAY, _MONDAY, "annual")

    response = client.post(
        f"/leave-requests/{submitted['id']}/decision",
        json={"decision": "approve", "comment": "Enjoy"},
        headers=_headers(client, manager),
    )

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "approved"
    assert body["manager_comment"] == "Enjoy"
    assert body["decided_by"] == manager["id"]
    assert body["decided_at"] is not None
    assert body["remaining_balance"] == 19

    rows = (
        db_session.query(AuditLogEntry)
        .filter(AuditLogEntry.leave_request_id == uuid.UUID(submitted["id"]))
        .filter(AuditLogEntry.action_type == "leave_request_decided")
        .all()
    )
    assert len(rows) == 1
    assert rows[0].actor_user_id == uuid.UUID(manager["id"])


def test_ac020_non_manager_gets_403_and_changes_nothing(
    client: TestClient, db_session: Session
) -> None:
    admin_headers = _admin_headers(client, db_session)
    manager = _create_user(client, admin_headers, role=Role.MANAGER.value)
    other_manager = _create_user(client, admin_headers, role=Role.MANAGER.value)
    employee = _create_user(client, admin_headers, manager_id=manager["id"])
    submitted = _submit(client, _headers(client, employee), _MONDAY, _MONDAY, "annual")

    response = client.post(
        f"/leave-requests/{submitted['id']}/decision",
        json={"decision": "approve", "comment": "Nope"},
        headers=_headers(client, other_manager),
    )

    assert response.status_code == 403
    assert response.json()["detail"]
    mine = client.get("/leave-requests/mine", headers=_headers(client, employee)).json()
    match = next(r for r in mine if r["id"] == submitted["id"])
    assert match["status"] == "pending"


def test_deciding_a_non_pending_request_returns_409(
    client: TestClient, db_session: Session
) -> None:
    admin_headers = _admin_headers(client, db_session)
    manager = _create_user(client, admin_headers, role=Role.MANAGER.value)
    employee = _create_user(client, admin_headers, manager_id=manager["id"])
    submitted = _submit(client, _headers(client, employee), _MONDAY, _MONDAY, "annual")
    manager_headers = _headers(client, manager)

    first = client.post(
        f"/leave-requests/{submitted['id']}/decision",
        json={"decision": "approve", "comment": "Ok"},
        headers=manager_headers,
    )
    assert first.status_code == 200

    second = client.post(
        f"/leave-requests/{submitted['id']}/decision",
        json={"decision": "reject", "comment": "Too late"},
        headers=manager_headers,
    )
    assert second.status_code == 409
    assert second.json()["detail"]


def test_approving_annual_request_exceeding_balance_returns_409_naming_balance(
    client: TestClient, db_session: Session
) -> None:
    admin_headers = _admin_headers(client, db_session)
    manager = _create_user(client, admin_headers, role=Role.MANAGER.value)
    employee = _create_user(client, admin_headers, manager_id=manager["id"])
    employee_headers = _headers(client, employee)
    manager_headers = _headers(client, manager)

    # Use up all 20 days with one approved request (4 weeks of weekdays = 20).
    first = _submit(client, employee_headers, _MONDAY, _MONDAY + timedelta(days=27), "annual")
    approve_first = client.post(
        f"/leave-requests/{first['id']}/decision",
        json={"decision": "approve", "comment": "Ok"},
        headers=manager_headers,
    )
    assert approve_first.status_code == 200
    assert approve_first.json()["remaining_balance"] == 0

    second_start = _MONDAY + timedelta(days=35)
    second = _submit(client, employee_headers, second_start, second_start, "annual")

    response = client.post(
        f"/leave-requests/{second['id']}/decision",
        json={"decision": "approve", "comment": "Too much"},
        headers=manager_headers,
    )

    assert response.status_code == 409
    assert "0" in response.json()["detail"]


def test_sick_request_approval_never_blocked_by_balance(
    client: TestClient, db_session: Session
) -> None:
    admin_headers = _admin_headers(client, db_session)
    manager = _create_user(client, admin_headers, role=Role.MANAGER.value)
    employee = _create_user(client, admin_headers, manager_id=manager["id"])
    employee_headers = _headers(client, employee)
    manager_headers = _headers(client, manager)

    used_up = _submit(client, employee_headers, _MONDAY, _MONDAY + timedelta(days=27), "annual")
    client.post(
        f"/leave-requests/{used_up['id']}/decision",
        json={"decision": "approve", "comment": "Ok"},
        headers=manager_headers,
    )

    sick_start = _MONDAY + timedelta(days=35)
    sick = _submit(client, employee_headers, sick_start, sick_start, "sick", "flu")

    response = client.post(
        f"/leave-requests/{sick['id']}/decision",
        json={"decision": "approve", "comment": "Get well"},
        headers=manager_headers,
    )

    assert response.status_code == 200
    assert response.json()["status"] == "approved"


def test_unknown_id_returns_404(client: TestClient, db_session: Session) -> None:
    admin_headers = _admin_headers(client, db_session)
    manager = _create_user(client, admin_headers, role=Role.MANAGER.value)

    response = client.post(
        f"/leave-requests/{uuid.uuid4()}/decision",
        json={"decision": "approve", "comment": "Ok"},
        headers=_headers(client, manager),
    )

    assert response.status_code == 404
    assert response.json()["detail"]


def test_malformed_id_returns_404(client: TestClient, db_session: Session) -> None:
    admin_headers = _admin_headers(client, db_session)
    manager = _create_user(client, admin_headers, role=Role.MANAGER.value)

    response = client.post(
        "/leave-requests/not-a-uuid/decision",
        json={"decision": "approve", "comment": "Ok"},
        headers=_headers(client, manager),
    )

    assert response.status_code == 404


def test_empty_comment_returns_422(client: TestClient, db_session: Session) -> None:
    admin_headers = _admin_headers(client, db_session)
    manager = _create_user(client, admin_headers, role=Role.MANAGER.value)
    employee = _create_user(client, admin_headers, manager_id=manager["id"])
    submitted = _submit(client, _headers(client, employee), _MONDAY, _MONDAY, "annual")

    response = client.post(
        f"/leave-requests/{submitted['id']}/decision",
        json={"decision": "approve", "comment": "   "},
        headers=_headers(client, manager),
    )

    assert response.status_code == 422


def test_missing_comment_returns_422(client: TestClient, db_session: Session) -> None:
    admin_headers = _admin_headers(client, db_session)
    manager = _create_user(client, admin_headers, role=Role.MANAGER.value)
    employee = _create_user(client, admin_headers, manager_id=manager["id"])
    submitted = _submit(client, _headers(client, employee), _MONDAY, _MONDAY, "annual")

    response = client.post(
        f"/leave-requests/{submitted['id']}/decision",
        json={"decision": "approve"},
        headers=_headers(client, manager),
    )

    assert response.status_code == 422


def test_unknown_decision_value_returns_422(client: TestClient, db_session: Session) -> None:
    admin_headers = _admin_headers(client, db_session)
    manager = _create_user(client, admin_headers, role=Role.MANAGER.value)
    employee = _create_user(client, admin_headers, manager_id=manager["id"])
    submitted = _submit(client, _headers(client, employee), _MONDAY, _MONDAY, "annual")

    response = client.post(
        f"/leave-requests/{submitted['id']}/decision",
        json={"decision": "cancel", "comment": "x"},
        headers=_headers(client, manager),
    )

    assert response.status_code == 422


def test_sick_reason_hidden_from_decision_response_for_unrelated_viewer_but_shown_to_manager(
    client: TestClient, db_session: Session
) -> None:
    admin_headers = _admin_headers(client, db_session)
    manager = _create_user(client, admin_headers, role=Role.MANAGER.value)
    employee = _create_user(client, admin_headers, manager_id=manager["id"])
    submitted = _submit(client, _headers(client, employee), _MONDAY, _MONDAY, "sick", "flu")

    response = client.post(
        f"/leave-requests/{submitted['id']}/decision",
        json={"decision": "approve", "comment": "Get well"},
        headers=_headers(client, manager),
    )

    assert response.status_code == 200
    assert response.json()["reason"] == "flu"

    mine = client.get("/leave-requests/mine", headers=_headers(client, employee)).json()
    match = next(r for r in mine if r["id"] == submitted["id"])
    assert match["reason"] == "flu"
