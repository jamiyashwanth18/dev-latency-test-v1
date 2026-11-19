"""Identity selection and session lifecycle: GET /users/active, POST /sessions,
GET /me, DELETE /sessions/current.

Every test creates its own users through the HTTP API with a uuid4 suffix so the
assertions are only about rows this test created, since the suite shares one
database and never truncates between tests.
"""

import uuid
from datetime import UTC, timedelta

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.config import get_settings
from app.dependencies import utcnow
from app.models import Role, User, UserSession


def _create_user(
    db_session: Session, *, role: str = Role.EMPLOYEE.value, is_active: bool = True
) -> User:
    user = User(full_name=f"Test User {uuid.uuid4()}", role=role, is_active=is_active)
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def test_ac001_returns_active_users_ordered_by_name_then_id(
    client: TestClient, db_session: Session
) -> None:
    suffix = uuid.uuid4().hex[:8]
    low = _create_user(db_session, role=Role.EMPLOYEE.value)
    low.full_name = f"aaa-{suffix}"
    high = _create_user(db_session, role=Role.MANAGER.value)
    high.full_name = f"ZZZ-{suffix}"
    db_session.commit()

    response = client.get("/users/active")

    assert response.status_code == 200
    body = response.json()
    names = [u["full_name"] for u in body if u["full_name"].endswith(suffix)]
    assert names == [low.full_name, high.full_name]
    match = next(u for u in body if u["id"] == str(low.id))
    assert match == {"id": str(low.id), "full_name": low.full_name, "role": low.role}


def test_ac002_deactivated_user_never_appears(client: TestClient, db_session: Session) -> None:
    inactive = _create_user(db_session, is_active=False)

    response = client.get("/users/active")

    assert response.status_code == 200
    assert str(inactive.id) not in {u["id"] for u in response.json()}


def test_sign_in_returns_opaque_token_and_user(client: TestClient, db_session: Session) -> None:
    user = _create_user(db_session)

    response = client.post("/sessions", json={"user_id": str(user.id)})

    assert response.status_code == 201
    body = response.json()
    assert 32 <= len(body["token"]) <= 128
    assert "." not in body["token"]  # not a JWT shape
    assert str(user.id) not in body["token"]
    assert body["user"] == {"id": str(user.id), "full_name": user.full_name, "role": user.role}
    assert body["expires_at"].endswith("Z")


def test_sign_in_unknown_user_id_returns_404_and_creates_no_session(
    client: TestClient, db_session: Session
) -> None:
    before = db_session.query(UserSession).count()

    response = client.post("/sessions", json={"user_id": str(uuid.uuid4())})

    assert response.status_code == 404
    assert response.json()["detail"]
    assert db_session.query(UserSession).count() == before


def test_sign_in_malformed_user_id_returns_404(client: TestClient) -> None:
    response = client.post("/sessions", json={"user_id": "not-a-uuid"})

    assert response.status_code == 404


def test_sign_in_deactivated_user_returns_404(client: TestClient, db_session: Session) -> None:
    user = _create_user(db_session, is_active=False)

    response = client.post("/sessions", json={"user_id": str(user.id)})

    assert response.status_code == 404


def test_sign_in_missing_user_id_returns_422(client: TestClient) -> None:
    response = client.post("/sessions", json={})

    assert response.status_code == 422


def test_signing_in_twice_creates_two_independent_sessions(
    client: TestClient, db_session: Session
) -> None:
    user = _create_user(db_session)

    first = client.post("/sessions", json={"user_id": str(user.id)}).json()
    second = client.post("/sessions", json={"user_id": str(user.id)}).json()
    assert first["token"] != second["token"]

    me_first = client.get("/me", headers={"Authorization": f"Bearer {first['token']}"})
    me_second = client.get("/me", headers={"Authorization": f"Bearer {second['token']}"})
    assert me_first.status_code == 200
    assert me_second.status_code == 200

    revoke = client.delete(
        "/sessions/current", headers={"Authorization": f"Bearer {first['token']}"}
    )
    assert revoke.status_code == 204

    still_good = client.get("/me", headers={"Authorization": f"Bearer {second['token']}"})
    assert still_good.status_code == 200


def test_authenticated_request_slides_the_idle_window(
    client: TestClient, db_session: Session
) -> None:
    user = _create_user(db_session)
    token = client.post("/sessions", json={"user_id": str(user.id)}).json()["token"]
    session_row = db_session.query(UserSession).filter(UserSession.token == token).one()
    session_row.expires_at = utcnow() + timedelta(minutes=1)
    session_row.last_active_at = utcnow() - timedelta(minutes=30)
    db_session.commit()

    response = client.get("/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    db_session.refresh(session_row)
    idle_minutes = get_settings().session_idle_minutes
    expected = utcnow() + timedelta(minutes=idle_minutes)
    delta = (session_row.expires_at.replace(tzinfo=UTC) - expected).total_seconds()
    assert abs(delta) < 5


def test_get_me_returns_identity(client: TestClient, db_session: Session) -> None:
    user = _create_user(db_session, role=Role.MANAGER.value)
    token = client.post("/sessions", json={"user_id": str(user.id)}).json()["token"]

    response = client.get("/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    assert response.json() == {
        "id": str(user.id),
        "full_name": user.full_name,
        "role": user.role,
        "manager_id": None,
        "is_active": True,
    }


def test_no_authorization_header_returns_401(client: TestClient) -> None:
    response = client.get("/me")

    assert response.status_code == 401
    assert response.json() == {"detail": "Not authenticated"}


def test_non_bearer_scheme_returns_401(client: TestClient, db_session: Session) -> None:
    user = _create_user(db_session)
    token = client.post("/sessions", json={"user_id": str(user.id)}).json()["token"]

    response = client.get("/me", headers={"Authorization": f"Basic {token}"})

    assert response.status_code == 401


def test_unknown_token_returns_401(client: TestClient) -> None:
    response = client.get("/me", headers={"Authorization": "Bearer not-a-real-token"})

    assert response.status_code == 401


def test_expired_token_returns_401(client: TestClient, db_session: Session) -> None:
    user = _create_user(db_session)
    token = client.post("/sessions", json={"user_id": str(user.id)}).json()["token"]
    session_row = db_session.query(UserSession).filter(UserSession.token == token).one()
    session_row.expires_at = utcnow() - timedelta(minutes=1)
    db_session.commit()

    response = client.get("/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 401


def test_sign_out_revokes_and_second_call_returns_401(
    client: TestClient, db_session: Session
) -> None:
    user = _create_user(db_session)
    token = client.post("/sessions", json={"user_id": str(user.id)}).json()["token"]

    first = client.delete("/sessions/current", headers={"Authorization": f"Bearer {token}"})
    assert first.status_code == 204
    assert first.content == b""

    second = client.delete("/sessions/current", headers={"Authorization": f"Bearer {token}"})
    assert second.status_code == 401


def test_deactivating_user_rejects_their_token_on_next_request(
    client: TestClient, db_session: Session
) -> None:
    user = _create_user(db_session)
    token = client.post("/sessions", json={"user_id": str(user.id)}).json()["token"]

    user.is_active = False
    db_session.commit()

    response = client.get("/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 401
