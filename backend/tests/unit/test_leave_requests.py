"""POST /leave-requests, GET /leave-requests/mine, GET /leave-requests/pending.

Every test creates its own users with a uuid4 suffix and asserts only on rows it
created, since the suite shares one database and never truncates between tests.

Every user other than the bootstrap HR/Admin is created through the real
POST /admin/users endpoint (and, for a deactivated user, the real PATCH), not by
writing rows into the ORM session directly, so a bug in that endpoint's own
authorization or validation would show up in these tests rather than being
invisible to them.
"""

import uuid
from datetime import date, timedelta

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import AuditLogEntry, Role, User

# A fixed Monday far enough in the future that it is deterministic across runs.
_MONDAY = date(2026, 11, 23)


def _bootstrap_hr_admin(db_session: Session) -> User:
    """The one user this file cannot create through the API: POST /admin/users
    itself needs an HR/Admin bearer already, and this test database has none
    seeded (BOOTSTRAP_ADMIN_EMAIL is unset here). Every other user below is
    created through the real admin API using this user's token."""
    user = User(
        full_name=f"Bootstrap Admin {uuid.uuid4()}", role=Role.HR_ADMIN.value, is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def _headers(client: TestClient, user: User | dict) -> dict:
    """Signs in as the given user -- an ORM row (only the bootstrap admin) or the
    JSON body POST /admin/users returned -- and returns bearer headers."""
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
    is_active: bool = True,
) -> dict:
    """Creates a user through the real admin API and returns the JSON body."""
    payload: dict = {"full_name": f"Test User {uuid.uuid4()}", "role": role}
    if manager_id is not None:
        payload["manager_id"] = manager_id
    response = client.post("/admin/users", json=payload, headers=admin_headers)
    assert response.status_code == 201, response.text
    body = response.json()
    if not is_active:
        patch = client.patch(
            f"/admin/users/{body['id']}", json={"is_active": False}, headers=admin_headers
        )
        assert patch.status_code == 200, patch.text
        body = patch.json()
    return body


def test_ac009_valid_submission_returns_201_pending_and_appears_in_mine(
    client: TestClient, db_session: Session
) -> None:
    admin_headers = _admin_headers(client, db_session)
    employee = _create_user(client, admin_headers)
    headers = _headers(client, employee)

    response = client.post(
        "/leave-requests",
        json={
            "start_date": _MONDAY.isoformat(),
            "end_date": (_MONDAY + timedelta(days=1)).isoformat(),
            "leave_type": "annual",
            "reason": "Family trip",
        },
        headers=headers,
    )

    assert response.status_code == 201
    body = response.json()
    assert body["status"] == "pending"
    assert body["working_days"] == 2
    assert body["reason"] == "Family trip"
    assert body["employee_id"] == employee["id"]

    mine = client.get("/leave-requests/mine", headers=headers)
    assert mine.status_code == 200
    assert body["id"] in {r["id"] for r in mine.json()}


def test_ac010_missing_reason_returns_422_and_creates_no_row(
    client: TestClient, db_session: Session
) -> None:
    admin_headers = _admin_headers(client, db_session)
    employee = _create_user(client, admin_headers)
    headers = _headers(client, employee)

    response = client.post(
        "/leave-requests",
        json={
            "start_date": _MONDAY.isoformat(),
            "end_date": _MONDAY.isoformat(),
            "leave_type": "annual",
        },
        headers=headers,
    )

    assert response.status_code == 422
    assert "detail" in response.json()
    mine = client.get("/leave-requests/mine", headers=headers)
    assert mine.json() == []


def test_ac010_whitespace_reason_returns_422(client: TestClient, db_session: Session) -> None:
    admin_headers = _admin_headers(client, db_session)
    employee = _create_user(client, admin_headers)
    headers = _headers(client, employee)

    response = client.post(
        "/leave-requests",
        json={
            "start_date": _MONDAY.isoformat(),
            "end_date": _MONDAY.isoformat(),
            "leave_type": "annual",
            "reason": "   ",
        },
        headers=headers,
    )

    assert response.status_code == 422


def test_ac010_unknown_leave_type_returns_422(client: TestClient, db_session: Session) -> None:
    admin_headers = _admin_headers(client, db_session)
    employee = _create_user(client, admin_headers)
    headers = _headers(client, employee)

    response = client.post(
        "/leave-requests",
        json={
            "start_date": _MONDAY.isoformat(),
            "end_date": _MONDAY.isoformat(),
            "leave_type": "vacation",
            "reason": "x",
        },
        headers=headers,
    )

    assert response.status_code == 422


def test_ac010_end_date_before_start_date_returns_422(
    client: TestClient, db_session: Session
) -> None:
    admin_headers = _admin_headers(client, db_session)
    employee = _create_user(client, admin_headers)
    headers = _headers(client, employee)

    response = client.post(
        "/leave-requests",
        json={
            "start_date": _MONDAY.isoformat(),
            "end_date": (_MONDAY - timedelta(days=1)).isoformat(),
            "leave_type": "annual",
            "reason": "x",
        },
        headers=headers,
    )

    assert response.status_code == 422


def test_ac011_weekend_only_range_returns_422(client: TestClient, db_session: Session) -> None:
    admin_headers = _admin_headers(client, db_session)
    employee = _create_user(client, admin_headers)
    headers = _headers(client, employee)
    saturday = _MONDAY - timedelta(days=2)
    sunday = _MONDAY - timedelta(days=1)

    response = client.post(
        "/leave-requests",
        json={
            "start_date": saturday.isoformat(),
            "end_date": sunday.isoformat(),
            "leave_type": "annual",
            "reason": "x",
        },
        headers=headers,
    )

    assert response.status_code == 422


def test_unauthenticated_post_returns_401(client: TestClient) -> None:
    response = client.post(
        "/leave-requests",
        json={
            "start_date": _MONDAY.isoformat(),
            "end_date": _MONDAY.isoformat(),
            "leave_type": "annual",
            "reason": "x",
        },
    )

    assert response.status_code == 401


def test_submission_writes_exactly_one_audit_log_row(
    client: TestClient, db_session: Session
) -> None:
    admin_headers = _admin_headers(client, db_session)
    employee = _create_user(client, admin_headers)
    headers = _headers(client, employee)

    response = client.post(
        "/leave-requests",
        json={
            "start_date": _MONDAY.isoformat(),
            "end_date": _MONDAY.isoformat(),
            "leave_type": "annual",
            "reason": "x",
        },
        headers=headers,
    )
    request_id = response.json()["id"]

    rows = (
        db_session.query(AuditLogEntry)
        .filter(AuditLogEntry.leave_request_id == uuid.UUID(request_id))
        .all()
    )
    assert len(rows) == 1
    assert rows[0].actor_user_id == uuid.UUID(employee["id"])
    assert rows[0].action_type
    assert isinstance(rows[0].detail, dict)


def test_has_overlap_true_when_pending_request_intersects(
    client: TestClient, db_session: Session
) -> None:
    admin_headers = _admin_headers(client, db_session)
    employee = _create_user(client, admin_headers)
    headers = _headers(client, employee)
    first = client.post(
        "/leave-requests",
        json={
            "start_date": _MONDAY.isoformat(),
            "end_date": (_MONDAY + timedelta(days=2)).isoformat(),
            "leave_type": "annual",
            "reason": "x",
        },
        headers=headers,
    )
    assert first.json()["has_overlap"] is False

    second = client.post(
        "/leave-requests",
        json={
            "start_date": (_MONDAY + timedelta(days=1)).isoformat(),
            "end_date": (_MONDAY + timedelta(days=3)).isoformat(),
            "leave_type": "annual",
            "reason": "y",
        },
        headers=headers,
    )
    assert second.json()["has_overlap"] is True


def test_mine_orders_created_at_desc_then_id_desc(client: TestClient, db_session: Session) -> None:
    admin_headers = _admin_headers(client, db_session)
    employee = _create_user(client, admin_headers)
    headers = _headers(client, employee)
    first = client.post(
        "/leave-requests",
        json={
            "start_date": _MONDAY.isoformat(),
            "end_date": _MONDAY.isoformat(),
            "leave_type": "annual",
            "reason": "first",
        },
        headers=headers,
    ).json()
    second = client.post(
        "/leave-requests",
        json={
            "start_date": (_MONDAY + timedelta(days=7)).isoformat(),
            "end_date": (_MONDAY + timedelta(days=7)).isoformat(),
            "leave_type": "annual",
            "reason": "second",
        },
        headers=headers,
    ).json()

    mine = client.get("/leave-requests/mine", headers=headers).json()
    ids = [r["id"] for r in mine]
    assert ids.index(second["id"]) < ids.index(first["id"])


def test_pending_returns_403_for_employee(client: TestClient, db_session: Session) -> None:
    admin_headers = _admin_headers(client, db_session)
    employee = _create_user(client, admin_headers)
    headers = _headers(client, employee)

    response = client.get("/leave-requests/pending", headers=headers)

    assert response.status_code == 403
    assert response.json()["detail"]


def test_pending_returns_direct_reports_requests_ordered_created_at_asc(
    client: TestClient, db_session: Session
) -> None:
    admin_headers = _admin_headers(client, db_session)
    manager = _create_user(client, admin_headers, role=Role.MANAGER.value)
    report_a = _create_user(client, admin_headers, manager_id=manager["id"])
    report_b = _create_user(client, admin_headers, manager_id=manager["id"])
    other_manager_report = _create_user(client, admin_headers)

    client.post(
        "/leave-requests",
        json={
            "start_date": _MONDAY.isoformat(),
            "end_date": _MONDAY.isoformat(),
            "leave_type": "annual",
            "reason": "a",
        },
        headers=_headers(client, report_a),
    )
    second = client.post(
        "/leave-requests",
        json={
            "start_date": (_MONDAY + timedelta(days=7)).isoformat(),
            "end_date": (_MONDAY + timedelta(days=7)).isoformat(),
            "leave_type": "annual",
            "reason": "b",
        },
        headers=_headers(client, report_b),
    ).json()
    client.post(
        "/leave-requests",
        json={
            "start_date": _MONDAY.isoformat(),
            "end_date": _MONDAY.isoformat(),
            "leave_type": "annual",
            "reason": "other",
        },
        headers=_headers(client, other_manager_report),
    )

    manager_headers = _headers(client, manager)
    response = client.get("/leave-requests/pending", headers=manager_headers)

    assert response.status_code == 200
    employee_ids = {r["employee_id"] for r in response.json()}
    assert employee_ids == {report_a["id"], report_b["id"]}
    created_ats = [r["created_at"] for r in response.json()]
    assert created_ats == sorted(created_ats)
    assert response.json()[-1]["id"] == second["id"]


def test_pending_returns_all_for_hr_admin(client: TestClient, db_session: Session) -> None:
    admin_headers = _admin_headers(client, db_session)
    hr_admin = _create_user(client, admin_headers, role=Role.HR_ADMIN.value)
    employee = _create_user(client, admin_headers)
    submitted = client.post(
        "/leave-requests",
        json={
            "start_date": _MONDAY.isoformat(),
            "end_date": _MONDAY.isoformat(),
            "leave_type": "annual",
            "reason": "x",
        },
        headers=_headers(client, employee),
    ).json()

    response = client.get("/leave-requests/pending", headers=_headers(client, hr_admin))

    assert response.status_code == 200
    assert submitted["id"] in {r["id"] for r in response.json()}


def test_sick_reason_hidden_from_an_unrelated_manager_but_visible_to_own_manager(
    client: TestClient, db_session: Session
) -> None:
    admin_headers = _admin_headers(client, db_session)
    own_manager = _create_user(client, admin_headers, role=Role.MANAGER.value)
    other_manager = _create_user(client, admin_headers, role=Role.MANAGER.value)
    employee = _create_user(client, admin_headers, manager_id=own_manager["id"])
    hr_admin = _create_user(client, admin_headers, role=Role.HR_ADMIN.value)

    submitted = client.post(
        "/leave-requests",
        json={
            "start_date": _MONDAY.isoformat(),
            "end_date": _MONDAY.isoformat(),
            "leave_type": "sick",
            "reason": "flu",
        },
        headers=_headers(client, employee),
    ).json()
    assert submitted["reason"] == "flu"

    mine = client.get("/leave-requests/mine", headers=_headers(client, employee)).json()
    assert mine[0]["reason"] == "flu"

    # own manager's pending view keeps the reason
    pending_for_own_manager = client.get(
        "/leave-requests/pending", headers=_headers(client, own_manager)
    ).json()
    own_match = next(r for r in pending_for_own_manager if r["id"] == submitted["id"])
    assert own_match["reason"] == "flu"

    # an unrelated manager -- not this employee's manager -- never gets the row at
    # all through /leave-requests/pending (it only ever returns direct reports'
    # requests), so the reason is hidden from them as a consequence.
    pending_for_other_manager = client.get(
        "/leave-requests/pending", headers=_headers(client, other_manager)
    ).json()
    assert submitted["id"] not in {r["id"] for r in pending_for_other_manager}

    pending_for_hr = client.get(
        "/leave-requests/pending", headers=_headers(client, hr_admin)
    ).json()
    match = next(r for r in pending_for_hr if r["id"] == submitted["id"])
    assert match["reason"] == "flu"


def test_annual_reason_never_stripped(client: TestClient, db_session: Session) -> None:
    admin_headers = _admin_headers(client, db_session)
    hr_admin = _create_user(client, admin_headers, role=Role.HR_ADMIN.value)
    employee = _create_user(client, admin_headers)

    submitted = client.post(
        "/leave-requests",
        json={
            "start_date": _MONDAY.isoformat(),
            "end_date": _MONDAY.isoformat(),
            "leave_type": "annual",
            "reason": "beach",
        },
        headers=_headers(client, employee),
    ).json()

    pending = client.get("/leave-requests/pending", headers=_headers(client, hr_admin)).json()
    match = next(r for r in pending if r["id"] == submitted["id"])
    assert match["reason"] == "beach"
