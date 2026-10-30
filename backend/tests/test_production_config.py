import pytest
from unittest.mock import patch
from app.core.config import Settings
from app.db.session import init_db

def test_production_jwt_secret_required():
    """Verify that in production, missing JWT_SECRET_KEY raises ValueError."""
    with pytest.raises(ValueError, match="JWT_SECRET_KEY is required in production"):
        Settings(ENVIRONMENT="production", JWT_SECRET_KEY="")

def test_production_jwt_secret_insecure_default_rejected():
    """Verify that the previous insecure default secret is rejected in production."""
    with pytest.raises(ValueError, match="Insecure/default JWT_SECRET_KEY detected in production"):
        Settings(
            ENVIRONMENT="production",
            JWT_SECRET_KEY="resourcebridge-hackathon-insecure-default-change-me"
        )

def test_production_jwt_secret_minimum_length():
    """Verify that a secret shorter than 32 characters is rejected in production."""
    with pytest.raises(ValueError, match="JWT_SECRET_KEY is too short"):
        Settings(
            ENVIRONMENT="production",
            JWT_SECRET_KEY="short-secret-key"
        )

def test_production_jwt_secret_valid():
    """Verify that a secure 32+ character secret succeeds in production."""
    valid_secret = "a-very-strong-production-secret-key-32-chars-long"
    s = Settings(
        ENVIRONMENT="production",
        JWT_SECRET_KEY=valid_secret
    )
    assert s.JWT_SECRET_KEY == valid_secret
    assert s.is_production is True

def test_development_jwt_secret_fallback():
    """Verify that development mode provides a local-only fallback secret."""
    s = Settings(ENVIRONMENT="development", JWT_SECRET_KEY=None)
    assert s.JWT_SECRET_KEY is not None
    assert len(s.JWT_SECRET_KEY) >= 32
    assert s.is_production is False

def test_conservative_connection_pool_defaults():
    """Verify conservative database connection pool defaults for Cloud Run & Supabase."""
    s = Settings()
    assert s.DB_POOL_SIZE == 3
    assert s.DB_MAX_OVERFLOW == 2
    assert s.DB_POOL_TIMEOUT == 15
    assert s.RUN_MIGRATIONS_ON_STARTUP is False

def test_cors_production_strips_localhost_and_requires_https():
    """Verify that in production, localhost and insecure/wildcard origins are stripped."""
    valid_secret = "a-very-strong-production-secret-key-32-chars-long"
    s = Settings(
        ENVIRONMENT="production",
        JWT_SECRET_KEY=valid_secret,
        FRONTEND_ORIGIN="http://localhost:5173",  # Insecure default must not leak into prod CORS
        CORS_ORIGINS="http://localhost:5173,https://resourcebridge.pages.dev,http://127.0.0.1:3000,https://*.pages.dev"
    )
    assert "https://resourcebridge.pages.dev" in s.CORS_ORIGINS
    assert "http://localhost:5173" not in s.CORS_ORIGINS
    assert "http://127.0.0.1:3000" not in s.CORS_ORIGINS
    assert "https://*.pages.dev" not in s.CORS_ORIGINS

def test_cors_development_includes_local_servers():
    """Verify that in development, local dev servers are permitted."""
    s = Settings(ENVIRONMENT="development")
    assert "http://localhost:5173" in s.CORS_ORIGINS
    assert "http://127.0.0.1:5173" in s.CORS_ORIGINS

def test_liveness_endpoint_independent_of_db(client):
    """Verify the liveness check returns 200 alive without touching the database."""
    with patch("app.main.check_db_connection", side_effect=Exception("DB check must not be called")):
        response = client.get("/health/live")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "alive"
        assert "ResourceBridge" in data["service"]

def test_readiness_endpoint_success(client):
    """Verify the readiness check returns 200 when database is connected."""
    response = client.get("/health/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert data["database"] == "connected"

def test_health_and_readiness_generic_message_on_db_down(client):
    """Verify that /health and /health/ready return 503 with generic messages and no raw error leakage."""
    leak_sensitive = "FATAL: password authentication failed for user 'postgres' at pooler.supabase.com:5432"
    with patch("app.main.check_db_connection", return_value=(False, leak_sensitive)):
        # Readiness probe fails with generic message
        readiness_resp = client.get("/health/ready")
        assert readiness_resp.status_code == 503
        data = readiness_resp.json()
        assert data["status"] == "not_ready"
        assert data["database"] == "disconnected"
        assert data["message"] == "Database service is unavailable"
        # Confirm zero leakage of hostnames, user, or password
        assert "postgres" not in str(data)
        assert "pooler.supabase.com" not in str(data)
        assert "password" not in str(data)

        # General health probe also returns generic 503
        health_resp = client.get("/health")
        assert health_resp.status_code == 503
        health_data = health_resp.json()
        assert health_data["status"] == "unhealthy"
        assert health_data["database"] == "disconnected"
        assert health_data["message"] == "Database service is unavailable"
        assert "postgres" not in str(health_data)
        assert "pooler.supabase.com" not in str(health_data)

def test_production_init_db_raises_on_connection_error():
    """Verify that init_db does not silently swallow errors in production."""
    with patch.object(Settings, "is_production", True):
        with patch("app.db.session.check_db_connection", return_value=(False, "Database service is unavailable")):
            with pytest.raises(RuntimeError, match="Database is unavailable at startup"):
                init_db()
