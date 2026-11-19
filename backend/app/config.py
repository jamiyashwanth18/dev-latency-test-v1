"""Settings, read once from the environment.

Every value the platform injects is read here and nowhere else, each with a
working local default so a fresh clone starts with no environment set. No
secret is ever written as a literal: the two secrets below default to empty
(meaning "not configured") or to a value generated for this process only.
"""

import os
import secrets
from functools import lru_cache

# Local fallbacks that are not secrets: the Vite dev server's origins.
_DEV_ORIGINS = ("http://localhost:5173", "http://127.0.0.1:5173")

# The leave policy the product states: 20 annual days per user per year. Kept here
# so the rules that spend and reset a balance all read one number.
ANNUAL_LEAVE_ALLOCATION_DAYS = 20

# How long a session created by the identity picker stays usable.
SESSION_TTL_HOURS = 12


class Settings:
    """Resolved configuration for one process."""

    def __init__(self) -> None:
        # SQLAlchemy URL of the PostgreSQL database. SQLite by default so the
        # service, its tests and the local E2E run work with no server to stand up.
        self.database_url: str = os.getenv("DATABASE_URL", "sqlite:///./app.db")

        # Comma-separated list of origins the SPA is served from. The frontend and
        # the API are always on different origins once deployed, so this decides
        # whether the browser lets the SPA call the API at all.
        raw_origins = os.getenv("ALLOWED_ORIGINS", "")
        self.allowed_origins: list[str] = [
            origin.strip() for origin in raw_origins.split(",") if origin.strip()
        ] or list(_DEV_ORIGINS)

        # The shared bearer the generated frontend sends. It is public (it is baked
        # into the SPA bundle), so it is never used to sign anything. Empty locally,
        # which means "no shared bearer is required".
        self.secret_key: str = os.getenv("SECRET_KEY", "")

        # Private signing key. Generated per process when unset, so a local run never
        # falls back to a value committed to the repository.
        self.jwt_secret_key: str = os.getenv("JWT_SECRET_KEY") or secrets.token_urlsafe(32)

        # A writable directory that survives redeploys.
        self.media_root: str = os.getenv("MEDIA_ROOT", "./media")

        # The first admin, seeded on startup when the platform sets both. Unset
        # locally and in tests, where nothing is seeded.
        self.bootstrap_admin_email: str = os.getenv("BOOTSTRAP_ADMIN_EMAIL", "")
        self.bootstrap_admin_password: str = os.getenv("BOOTSTRAP_ADMIN_PASSWORD", "")

        # The ordinary user the smoke test signs in as, seeded on the same terms.
        self.smoke_test_email: str = os.getenv("SMOKE_TEST_EMAIL", "")
        self.smoke_test_password: str = os.getenv("SMOKE_TEST_PASSWORD", "")

        self.annual_leave_allocation_days: int = ANNUAL_LEAVE_ALLOCATION_DAYS
        self.session_ttl_hours: int = SESSION_TTL_HOURS


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """One Settings instance per process; cleared in tests that change the env."""
    return Settings()
