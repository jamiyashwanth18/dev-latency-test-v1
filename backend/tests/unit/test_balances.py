"""GET /balances/mine.

Every test creates its own users through the real HTTP API (POST /admin/users,
POST /sessions) with a uuid4 suffix, and asserts only on rows it created, since
the suite shares one database and never truncates between tests. The one
exception is the bootstrap HR/Admin, which POST /admin/users itself needs
already authenticated and which this test database does not seed.

Deciding (approve/reject) a leave request has no endpoint in this ticket's
scope -- it is owned by a separate ticket -- so the one test that needs a
decided request sets status/manager_comment directly on the ORM row, the same
way test_sessions.py manipulates session rows no endpoint exposes.
"""

import uuid
from datetime import UTC, date, datetime, timedelta

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import LeaveBalance, LeaveStatus, Role, User

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


def _create_employee(client: TestClient, admin_headers: dict) -> dict:
    payload = {"full_name": f"Test User {uuid.uuid4()}", "role": Role.EMPLOYEE.value}
    response = client.post("/admin/users", json=payload, headers=admin_headers)
    assert response.status_code == 201, response.text
    return response.json()


def _submit(client: TestClient, headers: dict, start: date, end: date, leave_type: str) -> dict:
    response = client.post(
        "/leave-requests",
        json={
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
            "leave_type": leave_type,
            "reason": "x",
        },
        headers=headers,
    )
    assert response.status_code == 201, response.text
    return response.json()


def test_ac016_first_read_auto_creates_the_balance_row_with_defaults(
    client: TestClient, db_session: Session
) -> None:
    admin_headers = _admin_headers(client, db_session)
    employee = _create_employee(client, admin_headers)
    headers = _headers(client, employee)

    response = client.get("/balances/mine", headers=headers)

    assert response.status_code == 200
    body = response.json()
    assert body["allocated_days"] == 20
    assert body["adjustment_days"] == 0
    assert body["approved_annual_days"] == 0
    assert body["remaining_days"] == 20
    assert body["year"] == datetime.now(UTC).year

    row = (
        db_session.query(LeaveBalance)
        .filter(LeaveBalance.user_id == uuid.UUID(employee["id"]))
        .one()
    )
    assert row.allocated_days == 20
    assert row.adjustment_days == 0


def test_balance_shape_and_formula(client: TestClient, db_session: Session) -> None:
    admin_headers = _admin_headers(client, db_session)
    employee = _create_employee(client, admin_headers)
    headers = _headers(client, employee)

    current_year = datetime.now(UTC).year

    request = _submit(client, headers, _MONDAY, _MONDAY + timedelta(days=1), "annual")

    from app.models import LeaveRequest

    lr = db_session.get(LeaveRequest, uuid.UUID(request["id"]))
    assert lr is not None
    lr.status = LeaveStatus.APPROVED.value
    db_session.commit()

    response = client.get("/balances/mine", headers=headers)
    body = response.json()
    assert body["year"] == current_year
    assert body["allocated_days"] == 20
    assert body["adjustment_days"] == 0
    assert body["approved_annual_days"] == 2
    assert body["remaining_days"] == 18


def test_ac017_approved_sick_leave_never_changes_approved_annual_or_remaining(
    client: TestClient, db_session: Session
) -> None:
    from app.models import LeaveRequest

    admin_headers = _admin_headers(client, db_session)
    employee = _create_employee(client, admin_headers)
    headers = _headers(client, employee)

    request = _submit(client, headers, _MONDAY, _MONDAY, "sick")
    lr = db_session.get(LeaveRequest, uuid.UUID(request["id"]))
    assert lr is not None
    lr.status = LeaveStatus.APPROVED.value
    db_session.commit()

    response = client.get("/balances/mine", headers=headers).json()
    assert response["approved_annual_days"] == 0
    assert response["remaining_days"] == 20


def test_ac018_request_counts_against_the_year_of_its_start_date(
    client: TestClient, db_session: Session
) -> None:
    from app.models import LeaveRequest

    admin_headers = _admin_headers(client, db_session)
    employee = _create_employee(client, admin_headers)
    headers = _headers(client, employee)

    last_year = datetime.now(UTC).year - 1
    start = date(last_year, 12, 29)  # a Tuesday-ish date, use weekday math below
    # Walk to a weekday to keep working_days > 0 and avoid 422 on submission.
    while start.weekday() >= 5:
        start -= timedelta(days=1)
    end = start

    response = client.post(
        "/leave-requests",
        json={
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
            "leave_type": "annual",
            "reason": "x",
        },
        headers=headers,
    )
    assert response.status_code == 201, response.text
    lr = db_session.get(LeaveRequest, uuid.UUID(response.json()["id"]))
    assert lr is not None
    lr.status = LeaveStatus.APPROVED.value
    db_session.commit()

    current_year_balance = client.get("/balances/mine", headers=headers).json()
    assert current_year_balance["approved_annual_days"] == 0
    assert current_year_balance["remaining_days"] == 20


def test_only_approved_annual_requests_are_deducted(
    client: TestClient, db_session: Session
) -> None:
    admin_headers = _admin_headers(client, db_session)
    employee = _create_employee(client, admin_headers)
    headers = _headers(client, employee)

    _submit(client, headers, _MONDAY, _MONDAY, "annual")  # pending
    from app.models import LeaveRequest

    other_day = _MONDAY + timedelta(days=7)
    rejected_payload = _submit(client, headers, other_day, other_day, "annual")
    rejected = db_session.get(LeaveRequest, uuid.UUID(rejected_payload["id"]))
    assert rejected is not None
    rejected.status = LeaveStatus.REJECTED.value
    db_session.commit()

    response = client.get("/balances/mine", headers=headers).json()
    assert response["approved_annual_days"] == 0
    assert response["remaining_days"] == 20


def test_unauthenticated_call_returns_401(client: TestClient) -> None:
    response = client.get("/balances/mine")

    assert response.status_code == 401
    assert response.json() == {"detail": "Not authenticated"}


def test_authenticated_call_slides_the_idle_window(client: TestClient, db_session: Session) -> None:
    from datetime import timedelta as td

    from app.dependencies import utcnow
    from app.models import UserSession

    admin_headers = _admin_headers(client, db_session)
    employee = _create_employee(client, admin_headers)
    sign_in = client.post("/sessions", json={"user_id": employee["id"]})
    token = sign_in.json()["token"]
    session_row = db_session.query(UserSession).filter(UserSession.token == token).one()
    session_row.expires_at = utcnow() + td(minutes=1)
    db_session.commit()
    original_expiry = session_row.expires_at

    response = client.get("/balances/mine", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    db_session.refresh(session_row)
    assert session_row.expires_at.replace(tzinfo=UTC) > original_expiry.replace(tzinfo=UTC)


def test_ac014_ac015_mine_shows_updated_status_and_manager_comment_on_next_read(
    client: TestClient, db_session: Session
) -> None:
    from app.models import LeaveRequest

    admin_headers = _admin_headers(client, db_session)
    employee = _create_employee(client, admin_headers)
    headers = _headers(client, employee)

    submitted = _submit(client, headers, _MONDAY, _MONDAY, "annual")
    assert submitted["status"] == "pending"
    assert submitted["manager_comment"] is None

    lr = db_session.get(LeaveRequest, uuid.UUID(submitted["id"]))
    assert lr is not None
    lr.status = LeaveStatus.APPROVED.value
    lr.manager_comment = "Enjoy your trip"
    db_session.commit()

    mine = client.get("/leave-requests/mine", headers=headers).json()
    match = next(r for r in mine if r["id"] == submitted["id"])
    assert match["status"] == "approved"
    assert match["manager_comment"] == "Enjoy your trip"

    rejected_payload = _submit(
        client, headers, _MONDAY + timedelta(days=7), _MONDAY + timedelta(days=7), "annual"
    )
    rlr = db_session.get(LeaveRequest, uuid.UUID(rejected_payload["id"]))
    assert rlr is not None
    rlr.status = LeaveStatus.REJECTED.value
    rlr.manager_comment = "Team short-staffed that week"
    db_session.commit()

    mine_again = client.get("/leave-requests/mine", headers=headers).json()
    rejected_match = next(r for r in mine_again if r["id"] == rejected_payload["id"])
    assert rejected_match["status"] == "rejected"
    assert rejected_match["manager_comment"] == "Team short-staffed that week"
