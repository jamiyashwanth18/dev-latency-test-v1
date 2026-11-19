"""Pydantic request and response models.

One pair per entity in the approved data model, plus the placeholder every
generated route returns until it has been implemented.
"""

from pydantic import BaseModel, Field, field_validator

from app.models import Role

_VALID_ROLES = {r.value for r in Role}


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


class AdminUserPublic(BaseModel):
    """A user as shown to HR/Admin: full reporting-line and lifecycle detail."""

    id: str
    full_name: str
    role: str
    manager_id: str | None
    is_active: bool
    created_at: str


class AdminUserCreate(BaseModel):
    full_name: str = Field(min_length=1)
    role: str
    manager_id: str | None = None

    @field_validator("full_name")
    @classmethod
    def _non_blank_full_name(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("full_name must not be empty or whitespace")
        return v

    @field_validator("role")
    @classmethod
    def _known_role(cls, v: str) -> str:
        lowered = v.lower()
        if lowered not in _VALID_ROLES:
            raise ValueError("unknown role")
        return lowered


class AdminUserUpdate(BaseModel):
    full_name: str | None = None
    role: str | None = None
    manager_id: str | None = None
    is_active: bool | None = None

    @field_validator("full_name")
    @classmethod
    def _non_blank_full_name(cls, v: str | None) -> str:
        if v is None:
            raise ValueError("full_name must not be null")
        if not v.strip():
            raise ValueError("full_name must not be empty or whitespace")
        return v

    @field_validator("role")
    @classmethod
    def _known_role(cls, v: str | None) -> str:
        if v is None:
            raise ValueError("role must not be null")
        lowered = v.lower()
        if lowered not in _VALID_ROLES:
            raise ValueError("unknown role")
        return lowered

    @field_validator("is_active")
    @classmethod
    def _non_null_is_active(cls, v: bool | None) -> bool:
        if v is None:
            raise ValueError("is_active must not be null")
        return v


class StubResponse(BaseModel):
    """What a generated route returns until someone implements it.

    A stub that returns a typed body rather than raising keeps the service
    startable and its OpenAPI document complete, so the frontend can be built
    against the agreed shape while the handlers are still being written.
    """

    endpoint: str
    status: str = "not_implemented"
    detail: str = "Scaffolded from the approved API spec; no behaviour yet."
