"""Settings, read once from the environment.

Every value the platform injects is read here and nowhere else, each with a
working local default so a fresh clone starts with no environment set. No
secret is ever written as a literal: the two secrets below default to empty
(meaning "not configured") or to a value generated for this process only.
"""

import os
from functools import lru_cache

# Local fallbacks that are not secrets: the Vite dev server's origins.
_DEV_ORIGINS = ("http://localhost:5173", "http://127.0.0.1:5173")

# The leave policy the product states: 20 annual days per user per year. Kept here
# so the rules that spend and reset a balance all read one number.
ANNUAL_LEAVE_ALLOCATION_DAYS = 20

# Minutes of inactivity before a session expires; reset on every authenticated
# request so an active caller never sees its session expire mid-use.
SESSION_IDLE_MINUTES = 60


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

        # The first admin, seeded on startup when the platform sets both. Unset
        # locally and in tests, where nothing is seeded.
        self.bootstrap_admin_email: str = os.getenv("BOOTSTRAP_ADMIN_EMAIL", "")
        self.bootstrap_admin_password: str = os.getenv("BOOTSTRAP_ADMIN_PASSWORD", "")

        # The ordinary user the smoke test signs in as, seeded on the same terms.
        self.smoke_test_email: str = os.getenv("SMOKE_TEST_EMAIL", "")
        self.smoke_test_password: str = os.getenv("SMOKE_TEST_PASSWORD", "")

        self.annual_leave_allocation_days: int = ANNUAL_LEAVE_ALLOCATION_DAYS
        self.session_idle_minutes: int = int(
            os.getenv("SESSION_IDLE_MINUTES", str(SESSION_IDLE_MINUTES))
        )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """One Settings instance per process; cleared in tests that change the env."""
    return Settings()
