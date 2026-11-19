"""Pydantic request and response models.

One pair per entity in the approved data model, plus the placeholder every
generated route returns until it has been implemented.
"""

from pydantic import BaseModel, Field


class UserPublic(BaseModel):
    """The minimal shape of a user shown to anyone: the identity picker, /me's
    embedded user, and a session's embedded user."""

    id: str
    full_name: str
    role: str


class MeResponse(BaseModel):
    id: str
    full_name: str
    role: str
    manager_id: str | None
    is_active: bool


class SessionCreateRequest(BaseModel):
    """Sign-in needs nothing but the identity being selected."""

    user_id: str = Field(min_length=1)


class SessionResponse(BaseModel):
    token: str
    user: UserPublic
    expires_at: str


class StubResponse(BaseModel):
    """What a generated route returns until someone implements it.

    A stub that returns a typed body rather than raising keeps the service
    startable and its OpenAPI document complete, so the frontend can be built
    against the agreed shape while the handlers are still being written.
    """

    endpoint: str
    status: str = "not_implemented"
    detail: str = "Scaffolded from the approved API spec; no behaviour yet."
