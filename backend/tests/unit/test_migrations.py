"""The migrations run, and they build the schema the models declare.

Run against a throwaway SQLite file rather than the project's database: the point
is that `alembic upgrade head` works on an empty database and leaves every table
the application imports, which is what a container does on startup.
"""

from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect

from app.config import get_settings
from app.database import BACKEND_ROOT, Base


def _alembic_config() -> Config:
    config = Config(str(BACKEND_ROOT / "alembic.ini"))
    config.set_main_option("script_location", str(BACKEND_ROOT / "migrations"))
    return config


def test_upgrade_head_builds_every_table_the_models_declare(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    url = f"sqlite:///{tmp_path / 'migrated.db'}"
    monkeypatch.setenv("DATABASE_URL", url)
    get_settings.cache_clear()
    try:
        command.upgrade(_alembic_config(), "head")

        tables = set(inspect(create_engine(url)).get_table_names())
    finally:
        get_settings.cache_clear()

    missing = set(Base.metadata.tables) - tables
    assert not missing, f"migrations do not create: {sorted(missing)}"
    assert "alembic_version" in tables


def test_downgrade_removes_the_schema_again(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    url = f"sqlite:///{tmp_path / 'reversible.db'}"
    monkeypatch.setenv("DATABASE_URL", url)
    get_settings.cache_clear()
    try:
        config = _alembic_config()
        command.upgrade(config, "head")
        command.downgrade(config, "base")

        tables = set(inspect(create_engine(url)).get_table_names())
    finally:
        get_settings.cache_clear()

    assert not set(Base.metadata.tables) & tables
