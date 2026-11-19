"""GET /admin/users, POST /admin/users, PATCH /admin/users/{id}.

Every test creates its own users with a uuid4 suffix and asserts only on rows it
created, since the suite shares one database and never truncates between tests.
"""

import uuid

from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Role, User, UserSession


def _create_user(
    db_session: Session, *, role: str = Role.EMPLOYEE.value, is_active: bool = True
) -> User:
    user = User(full_name=f"Test User {uuid.uuid4()}", role=role, is_active=is_active)
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def _token_for(client: TestClient, user: User) -> str:
    response = client.post("/sessions", json={"user_id": str(user.id)})
    assert response.status_code == 201
    return response.json()["token"]


def _hr_admin_headers(client: TestClient, db_session: Session) -> dict:
    admin = _create_user(db_session, role=Role.HR_ADMIN.value)
    return {"Authorization": f"Bearer {_token_for(client, admin)}"}


def test_ac028_create_user_returns_201_and_appears_in_active_users(
    client: TestClient, db_session: Session
) -> None:
    headers = _hr_admin_headers(client, db_session)
    name = f"New Hire {uuid.uuid4()}"

    response = client.post(
        "/admin/users", json={"full_name": name, "role": "employee"}, headers=headers
    )

    assert response.status_code == 201
    body = response.json()
    assert body["full_name"] == name
    assert body["role"] == "employee"
    assert body["is_active"] is True
    assert body["manager_id"] is None

    active = client.get("/users/active")
    assert body["id"] in {u["id"] for u in active.json()}


def test_ac029_deactivation_revokes_sessions_and_hides_from_active(
    client: TestClient, db_session: Session
) -> None:
    headers = _hr_admin_headers(client, db_session)
    employee = _create_user(db_session)
    token = _token_for(client, employee)

    response = client.patch(
        f"/admin/users/{employee.id}", json={"is_active": False}, headers=headers
    )

    assert response.status_code == 200
    assert response.json()["is_active"] is False

    active = client.get("/users/active")
    assert str(employee.id) not in {u["id"] for u in active.json()}

    me = client.get("/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 401

    sessions = db_session.scalars(
        select(UserSession).where(UserSession.user_id == employee.id)
    ).all()
    assert sessions and all(s.revoked_at is not None for s in sessions)


def test_ac030_manager_assignment_sets_reporting_line(
    client: TestClient, db_session: Session
) -> None:
    headers = _hr_admin_headers(client, db_session)
    manager = _create_user(db_session, role=Role.MANAGER.value)
    employee = _create_user(db_session)

    response = client.patch(
        f"/admin/users/{employee.id}",
        json={"manager_id": str(manager.id)},
        headers=headers,
    )

    assert response.status_code == 200
    assert response.json()["manager_id"] == str(manager.id)
    db_session.refresh(employee)
    assert employee.manager_id == manager.id


def test_list_users_ordered_by_full_name_case_insensitive_then_id(
    client: TestClient, db_session: Session
) -> None:
    headers = _hr_admin_headers(client, db_session)
    suffix = uuid.uuid4().hex[:8]
    low = _create_user(db_session)
    low.full_name = f"aaa-{suffix}"
    high = _create_user(db_session)
    high.full_name = f"ZZZ-{suffix}"
    db_session.commit()

    response = client.get("/admin/users", headers=headers)

    assert response.status_code == 200
    names = [u["full_name"] for u in response.json() if u["full_name"].endswith(suffix)]
    assert names == [low.full_name, high.full_name]


def test_role_change_via_patch(client: TestClient, db_session: Session) -> None:
    headers = _hr_admin_headers(client, db_session)
    employee = _create_user(db_session)

    response = client.patch(
        f"/admin/users/{employee.id}", json={"role": "Manager"}, headers=headers
    )

    assert response.status_code == 200
    assert response.json()["role"] == "manager"


def test_role_accepted_case_insensitively_and_stored_lowercase_on_create(
    client: TestClient, db_session: Session
) -> None:
    headers = _hr_admin_headers(client, db_session)

    response = client.post(
        "/admin/users",
        json={"full_name": f"Casey {uuid.uuid4()}", "role": "HR_ADMIN"},
        headers=headers,
    )

    assert response.status_code == 201
    assert response.json()["role"] == "hr_admin"


def test_non_hr_admin_caller_gets_403_and_changes_nothing(
    client: TestClient, db_session: Session
) -> None:
    admin_headers = _hr_admin_headers(client, db_session)
    manager = _create_user(db_session, role=Role.MANAGER.value)
    headers = {"Authorization": f"Bearer {_token_for(client, manager)}"}
    before_count = len(client.get("/admin/users", headers=admin_headers).json())

    response = client.post(
        "/admin/users",
        json={"full_name": f"Blocked {uuid.uuid4()}", "role": "employee"},
        headers=headers,
    )

    assert response.status_code == 403
    assert response.json()["detail"]
    after_count = len(client.get("/admin/users", headers=admin_headers).json())
    assert after_count == before_count


def test_unauthenticated_call_returns_401(client: TestClient) -> None:
    response = client.get("/admin/users")

    assert response.status_code == 401
    assert response.json() == {"detail": "Not authenticated"}


def test_malformed_id_returns_404(client: TestClient, db_session: Session) -> None:
    headers = _hr_admin_headers(client, db_session)

    response = client.patch("/admin/users/not-a-uuid", json={"full_name": "X"}, headers=headers)

    assert response.status_code == 404


def test_well_formed_but_unknown_id_returns_404(client: TestClient, db_session: Session) -> None:
    headers = _hr_admin_headers(client, db_session)

    response = client.patch(
        f"/admin/users/{uuid.uuid4()}", json={"full_name": "X"}, headers=headers
    )

    assert response.status_code == 404


def test_unknown_manager_id_on_create_returns_404(client: TestClient, db_session: Session) -> None:
    headers = _hr_admin_headers(client, db_session)

    response = client.post(
        "/admin/users",
        json={
            "full_name": f"Orphan {uuid.uuid4()}",
            "role": "employee",
            "manager_id": str(uuid.uuid4()),
        },
        headers=headers,
    )

    assert response.status_code == 404


def test_unknown_manager_id_on_patch_returns_404(client: TestClient, db_session: Session) -> None:
    headers = _hr_admin_headers(client, db_session)
    employee = _create_user(db_session)

    response = client.patch(
        f"/admin/users/{employee.id}",
        json={"manager_id": str(uuid.uuid4())},
        headers=headers,
    )

    assert response.status_code == 404


def test_empty_full_name_returns_422(client: TestClient, db_session: Session) -> None:
    headers = _hr_admin_headers(client, db_session)

    response = client.post(
        "/admin/users", json={"full_name": "   ", "role": "employee"}, headers=headers
    )

    assert response.status_code == 422


def test_unknown_role_returns_422(client: TestClient, db_session: Session) -> None:
    headers = _hr_admin_headers(client, db_session)

    response = client.post(
        "/admin/users",
        json={"full_name": f"Someone {uuid.uuid4()}", "role": "superuser"},
        headers=headers,
    )

    assert response.status_code == 422
