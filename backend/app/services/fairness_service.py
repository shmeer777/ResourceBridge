from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.booking import Booking
from app.models.user import User

MAX_ACTIVE_BOOKINGS_PER_SEEKER = 5

def check_seeker_fairness_quota(db: Session, seeker: User, resource_id: str) -> None:
    """Ensure a seeker cannot monopolize a resource with excessive pending/active bookings."""
    active_count = (
        db.query(Booking)
        .filter(
            Booking.seeker_id == seeker.id,
            Booking.status.in_(["pending", "approved", "checked_in"]),
        )
        .count()
    )

    if active_count >= MAX_ACTIVE_BOOKINGS_PER_SEEKER:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Fairness policy: You have {active_count} active or pending reservations across the platform. Please complete or cancel existing reservations before booking more.",
        )
