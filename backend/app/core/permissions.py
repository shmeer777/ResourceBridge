from fastapi import HTTPException, status
from app.models.user import User
from app.models.resource import Resource
from app.models.booking import Booking

def verify_resource_ownership(resource: Resource, user: User) -> None:
    """Ensure the user is the owner of the resource."""
    if resource.owner_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to manage this resource"
        )

def verify_booking_participant(booking: Booking, user: User) -> None:
    """Ensure the user is either the seeker who booked or the provider who owns the resource."""
    is_seeker = booking.seeker_id == user.id
    is_owner = booking.resource and booking.resource.owner_id == user.id
    if not (is_seeker or is_owner):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view or modify this booking"
        )
