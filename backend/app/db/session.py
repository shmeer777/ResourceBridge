import logging
import os
import re
import sys
from pathlib import Path
from typing import Generator, Tuple
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session

from app.core.config import settings
from app.db.base import Base

logger = logging.getLogger(__name__)

connect_args = {}
engine_kwargs = {
    "connect_args": connect_args,
    "pool_pre_ping": True,
    "echo": False
}

if settings.SQLALCHEMY_DATABASE_URI.startswith("sqlite"):
    connect_args["check_same_thread"] = False
else:
    # Conservative production pool settings for Cloud Run autoscaling & Supabase limits
    engine_kwargs.update({
        "pool_size": settings.DB_POOL_SIZE,
        "max_overflow": settings.DB_MAX_OVERFLOW,
        "pool_recycle": settings.DB_POOL_RECYCLE,
        "pool_timeout": settings.DB_POOL_TIMEOUT
    })

engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URI,
    **engine_kwargs
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency to yield an isolated database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def _redact_database_credentials(text_to_redact: str) -> str:
    """Sanitize database URLs and credentials from log strings."""
    redacted = re.sub(r"://([^:@]+):([^@]+)@", r"://\1:***@", str(text_to_redact))
    redacted = re.sub(r"password=([^&;\s]+)", r"password=***", redacted)
    return redacted

def check_db_connection() -> Tuple[bool, str]:
    """Check if the database is reachable and accepting queries.
    Returns (True, 'connected') or (False, 'Database service is unavailable').
    Raw errors are redacted and logged on the server only, never returned to callers.
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True, "connected"
    except Exception as e:
        safe_log_msg = _redact_database_credentials(str(e))
        logger.error(f"Database readiness check failed: {safe_log_msg}")
        return False, "Database service is unavailable"

def apply_migrations() -> None:
    """Run pending database migrations explicitly via Alembic.
    Raises RuntimeError if migrations fail.
    """
    try:
        from alembic.config import Config
        from alembic import command

        backend_dir = Path(__file__).resolve().parents[2]
        alembic_ini_path = backend_dir / "alembic.ini"
        migrations_path = backend_dir / "migrations"

        if not alembic_ini_path.exists():
            alembic_ini_path = Path("alembic.ini").resolve()
            migrations_path = Path("migrations").resolve()

        if not alembic_ini_path.exists():
            raise FileNotFoundError(f"alembic.ini not found at {alembic_ini_path}")

        backend_str = str(backend_dir)
        if backend_str not in sys.path:
            sys.path.insert(0, backend_str)

        alembic_cfg = Config(str(alembic_ini_path))
        alembic_cfg.set_main_option("script_location", str(migrations_path))
        alembic_cfg.set_main_option("sqlalchemy.url", settings.SQLALCHEMY_DATABASE_URI)

        logger.info(f"Applying database migrations using config: {alembic_ini_path}")
        command.upgrade(alembic_cfg, "head")
        logger.info("Database migrations applied / verified successfully at head.")
    except Exception as e:
        safe_error = _redact_database_credentials(str(e))
        logger.critical(f"FATAL: Database migration failed: {safe_error}", exc_info=True)
        raise RuntimeError(f"Database migration failed: {safe_error}") from e

def init_db() -> None:
    """Database startup handler.
    - In production: verifies DB connection; does NOT run auto-migrations by default.
    - In development: ensures schema exists and verifies connectivity.
    """
    if settings.is_production:
        # In production: strict connection verification
        is_connected, _ = check_db_connection()
        if not is_connected:
            raise RuntimeError("Database is unavailable at startup. Check database service status.")

        if settings.RUN_MIGRATIONS_ON_STARTUP:
            # Only if explicitly opted-in (e.g. one-off migration job)
            apply_migrations()
    else:
        # In development / local testing
        try:
            if settings.SQLALCHEMY_DATABASE_URI.startswith("sqlite"):
                # SQLite local development schema setup
                Base.metadata.create_all(bind=engine)
            else:
                is_connected, _ = check_db_connection()
                if not is_connected:
                    logger.warning("Development database connection warning: Database unreachable")
                elif settings.RUN_MIGRATIONS_ON_STARTUP:
                    apply_migrations()
        except Exception as e:
            logger.warning(f"Development database initialization warning: {e}")
