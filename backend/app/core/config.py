import os
from typing import List, Optional, Union
from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    ENVIRONMENT: str = "development"
    PROJECT_NAME: str = "ResourceBridge API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"

    # Database
    DATABASE_URL: str = "sqlite:///./resourcebridge.db"
    # In production, do not run automatic migrations on startup to prevent race conditions during Cloud Run autoscaling
    RUN_MIGRATIONS_ON_STARTUP: bool = False

    # Database connection pool settings (conservative defaults for Cloud Run & Supabase limits)
    DB_POOL_SIZE: int = 3
    DB_MAX_OVERFLOW: int = 2
    DB_POOL_TIMEOUT: int = 15
    DB_POOL_RECYCLE: int = 300

    # Authentication & JWT
    JWT_SECRET_KEY: Optional[str] = None
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # CORS
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    CORS_ORIGINS: Union[List[str], str] = []

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() in ("production", "prod")

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        url = self.DATABASE_URL
        # Normalize postgres driver for SQLAlchemy with psycopg3
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+psycopg://", 1)
        elif url.startswith("postgresql://") and not url.startswith("postgresql+"):
            url = url.replace("postgresql://", "postgresql+psycopg://", 1)
        return url

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str], None]) -> List[str]:
        if not v:
            return []
        if isinstance(v, str):
            v_str = v.strip()
            if v_str.startswith("[") and v_str.endswith("]"):
                import json
                try:
                    return json.loads(v_str)
                except Exception:
                    pass
            return [i.strip() for i in v_str.split(",") if i.strip()]
        elif isinstance(v, (list, tuple, set)):
            return [str(i).strip() for i in v if str(i).strip()]
        return []

    @model_validator(mode="after")
    def validate_environment_and_security(self) -> "Settings":
        is_prod = self.is_production

        # 1. JWT Security Validation
        insecure_keys = {
            "resourcebridge-hackathon-insecure-default-change-me",
            "secret",
            "changeme",
            "jwt-secret",
            "your-secret-key",
            "password",
            "12345678",
            "default"
        }

        if is_prod:
            if not self.JWT_SECRET_KEY or not self.JWT_SECRET_KEY.strip():
                raise ValueError(
                    "CRITICAL SECURITY CONFIGURATION ERROR: JWT_SECRET_KEY is required in production. "
                    "Set the JWT_SECRET_KEY environment variable to a secure random string (minimum 32 characters)."
                )
            clean_key = self.JWT_SECRET_KEY.strip()
            if clean_key in insecure_keys:
                raise ValueError(
                    "CRITICAL SECURITY CONFIGURATION ERROR: Insecure/default JWT_SECRET_KEY detected in production. "
                    "You must provide a unique, cryptographically secure JWT_SECRET_KEY."
                )
            if len(clean_key) < 32:
                raise ValueError(
                    f"CRITICAL SECURITY CONFIGURATION ERROR: JWT_SECRET_KEY is too short ({len(clean_key)} chars). "
                    "Production requires a minimum of 32 characters."
                )
            self.JWT_SECRET_KEY = clean_key
        else:
            # Development / local fallback
            if not self.JWT_SECRET_KEY or not self.JWT_SECRET_KEY.strip():
                self.JWT_SECRET_KEY = "resourcebridge-dev-local-secret-key-minimum-32-chars-long"

        # 2. CORS Validation
        parsed_origins = list(self.CORS_ORIGINS) if isinstance(self.CORS_ORIGINS, list) else []

        if is_prod:
            # In production: strict explicit origins only.
            # Must use HTTPS, must not contain localhost / 127.0.0.1 / 0.0.0.0, and must not contain wildcards.
            prod_origins = []
            for origin in parsed_origins:
                clean_origin = origin.strip().rstrip("/")
                if not clean_origin:
                    continue
                if "*" in clean_origin or any(lh in clean_origin.lower() for lh in ("localhost", "127.0.0.1", "0.0.0.0")):
                    continue
                if clean_origin.startswith("https://"):
                    if clean_origin not in prod_origins:
                        prod_origins.append(clean_origin)

            # Check FRONTEND_ORIGIN: only allow if it is a valid HTTPS origin, not localhost or wildcard
            if self.FRONTEND_ORIGIN:
                clean_frontend = self.FRONTEND_ORIGIN.strip().rstrip("/")
                if clean_frontend.startswith("https://") and not any(lh in clean_frontend.lower() for lh in ("localhost", "127.0.0.1", "0.0.0.0", "*")):
                    if clean_frontend not in prod_origins:
                        prod_origins.append(clean_frontend)

            self.CORS_ORIGINS = prod_origins
        else:
            # In development: ensure local development servers are permitted
            dev_defaults = [
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:3000",
                "http://127.0.0.1:3000"
            ]
            for origin in dev_defaults:
                if origin not in parsed_origins:
                    parsed_origins.append(origin)
            if self.FRONTEND_ORIGIN and self.FRONTEND_ORIGIN not in parsed_origins:
                parsed_origins.append(self.FRONTEND_ORIGIN)
            self.CORS_ORIGINS = parsed_origins

        return self

settings = Settings()
