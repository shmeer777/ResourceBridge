from fastapi import APIRouter

from app.api.routes import (
    auth,
    resources,
    bookings,
    reports,
    audit,
    users,
    organizations,
    availability,
    checkin,
    messages
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(resources.router)
api_router.include_router(bookings.router)
api_router.include_router(reports.router)
api_router.include_router(audit.router)
api_router.include_router(users.router)
api_router.include_router(organizations.router)
api_router.include_router(availability.router)
api_router.include_router(checkin.router)
api_router.include_router(messages.router)
