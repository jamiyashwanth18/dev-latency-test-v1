"""POST /leave-requests, GET /leave-requests/mine, GET /leave-requests/pending.

Every test creates its own users with a uuid4 suffix and asserts only on rows it
created, since the suite shares one database and never truncates between tests.
"""

import uuid
from datetime import date, timedelta

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import AuditLogEntry, Role, User

# A fixed Monday far enough in the future that it is deterministic across runs.
_MONDAY = date(2026, 11, 23)


def _create_user(
    db_session: Session,
    *,
    role: str = Role.EMPLOYEE.value,
    manager_id: uuid.UUID | None = None,
    is_active: bool = True,
) -> User:
    user = User(
        full_name=f"Test User {uuid.uuid4()}",
        role=role,
        manager_id=manager_id,
        is_active=is_active,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def _headers(client: TestClient, user: User) -> dict:
    response = client.post("/sessions", json={"user_id": str(user.id)})
    assert response.status_code == 201
    return {"Authorization": f"Bearer {response.json()['token']}"}


def test_ac009_valid_submission_returns_201_pending_and_appears_in_mine(
    client: TestClient, db_session: Session
) -> None:
    employee = _create_user(db_session)
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
    assert body["employee_id"] == str(employee.id)

    mine = client.get("/leave-requests/mine", headers=headers)
    assert mine.status_code == 200
    assert body["id"] in {r["id"] for r in mine.json()}


def test_ac010_missing_reason_returns_422_and_creates_no_row(
    client: TestClient, db_session: Session
) -> None:
    employee = _create_user(db_session)
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
    employee = _create_user(db_session)
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
    employee = _create_user(db_session)
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
    employee = _create_user(db_session)
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
    employee = _create_user(db_session)
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
    employee = _create_user(db_session)
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
    assert rows[0].actor_user_id == employee.id
    assert rows[0].action_type
    assert isinstance(rows[0].detail, dict)


def test_has_overlap_true_when_pending_request_intersects(
    client: TestClient, db_session: Session
) -> None:
    employee = _create_user(db_session)
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
    employee = _create_user(db_session)
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
    employee = _create_user(db_session)
    headers = _headers(client, employee)

    response = client.get("/leave-requests/pending", headers=headers)

    assert response.status_code == 403
    assert response.json()["detail"]


def test_pending_returns_direct_reports_requests_ordered_created_at_asc(
    client: TestClient, db_session: Session
) -> None:
    manager = _create_user(db_session, role=Role.MANAGER.value)
    report_a = _create_user(db_session, manager_id=manager.id)
    report_b = _create_user(db_session, manager_id=manager.id)
    other_manager_report = _create_user(db_session)

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
    assert employee_ids == {str(report_a.id), str(report_b.id)}
    created_ats = [r["created_at"] for r in response.json()]
    assert created_ats == sorted(created_ats)
    assert response.json()[-1]["id"] == second["id"]


def test_pending_returns_all_for_hr_admin(client: TestClient, db_session: Session) -> None:
    hr_admin = _create_user(db_session, role=Role.HR_ADMIN.value)
    employee = _create_user(db_session)
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
    own_manager = _create_user(db_session, role=Role.MANAGER.value)
    other_manager = _create_user(db_session, role=Role.MANAGER.value)
    employee = _create_user(db_session, manager_id=own_manager.id)

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

    own_manager_headers = _headers(client, own_manager)
    hr_admin = _create_user(db_session, role=Role.HR_ADMIN.value)

    mine = client.get("/leave-requests/mine", headers=_headers(client, employee)).json()
    assert mine[0]["reason"] == "flu"

    other_manager.manager_id = None
    db_session.commit()

    # own manager's pending view keeps the reason
    pending_for_own_manager = client.get(
        "/leave-requests/pending", headers=own_manager_headers
    ).json()
    assert pending_for_own_manager[0]["reason"] == "flu"

    pending_for_hr = client.get(
        "/leave-requests/pending", headers=_headers(client, hr_admin)
    ).json()
    match = next(r for r in pending_for_hr if r["id"] == submitted["id"])
    assert match["reason"] == "flu"


def test_annual_reason_never_stripped(client: TestClient, db_session: Session) -> None:
    hr_admin = _create_user(db_session, role=Role.HR_ADMIN.value)
    employee = _create_user(db_session)

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
