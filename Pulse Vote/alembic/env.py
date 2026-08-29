from logging.config import fileConfig
from pathlib import Path
import os
import sys

from alembic import context
from dotenv import load_dotenv
from sqlalchemy import create_engine, pool


PROJECT_ROOT = Path(__file__).resolve().parent.parent

BACKEND_PATH = PROJECT_ROOT / "Backend"

sys.path.insert(0, str(BACKEND_PATH))

load_dotenv(PROJECT_ROOT / ".env")


from app.db.connection import Base
import app.models.tables


config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)


DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is missing in .env file")


target_metadata = Base.metadata


def run_migrations_offline() -> None:
    context.configure(
        url=DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = create_engine(
        DATABASE_URL,
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()