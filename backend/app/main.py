import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.session import init_db, check_db_connection
from app.api.router import api_router

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Safe schema setup and database readiness verification on application startup
    logger.info(f"Starting {settings.PROJECT_NAME} (environment: {settings.ENVIRONMENT})")
    try:
        init_db()
    except Exception as e:
        logger.critical(f"Database initialization error on startup: {e}", exc_info=True)
        if settings.is_production:
            # In production, never swallow database failures: halt startup
            raise RuntimeError(f"Startup aborted due to database failure: {e}") from e
        else:
            logger.warning(f"Development startup warning: {e}")
    yield
    logger.info(f"Shutting down {settings.PROJECT_NAME}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS configuration for frontend: strictly use explicit allowed origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Core API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

# --- Health Check Endpoints ---

@app.get("/health/live", tags=["health"])
@app.get(f"{settings.API_V1_STR}/health/live", tags=["health"])
def liveness_check():
    """Liveness probe: verifies the web process is running.
    Does not touch the database.
    """
    return {
        "status": "alive",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }

@app.get("/health/ready", tags=["health"])
@app.get(f"{settings.API_V1_STR}/health/ready", tags=["health"])
def readiness_check():
    """Readiness probe: validates live database connectivity.
    Returns 200 when ready, 503 if database is disconnected.
    Returns a generic message to prevent leaking internal database details.
    """
    is_connected, _ = check_db_connection()
    if not is_connected:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "not_ready",
                "database": "disconnected",
                "message": "Database service is unavailable",
                "service": settings.PROJECT_NAME,
                "version": settings.VERSION,
                "environment": settings.ENVIRONMENT
            }
        )
    return {
        "status": "ready",
        "database": "connected",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }

@app.get("/health", tags=["health"])
@app.get(f"{settings.API_V1_STR}/health", tags=["health"])
def health_check():
    """Comprehensive health check: returns 200 if server and database are healthy; 503 if database fails.
    Returns a generic message without exposing credentials or internal topology.
    """
    is_connected, _ = check_db_connection()
    if not is_connected:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unhealthy",
                "database": "disconnected",
                "message": "Database service is unavailable",
                "service": settings.PROJECT_NAME,
                "version": settings.VERSION,
                "environment": settings.ENVIRONMENT
            }
        )
    return {
        "status": "ok",
        "database": "connected",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }

@app.get("/", include_in_schema=False)
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "docs": "/docs",
        "health": "/health",
        "liveness": "/health/live",
        "readiness": "/health/ready"
    }
