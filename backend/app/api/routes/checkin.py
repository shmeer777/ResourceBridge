from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.schemas.booking import BookingCheckIn, BookingCheckOut, BookingOut
from app.core.dependencies import get_current_user
from app.services.booking_service import check_in_booking, check_out_booking

router = APIRouter(tags=["checkin"])

@router.post("/check-in/{booking_id}", response_model=BookingOut)
def record_check_in(
    booking_id: str,
    checkin_in: BookingCheckIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Alias endpoint for performing resource check-in."""
    return check_in_booking(db=db, booking_id=booking_id, checkin_in=checkin_in, user=current_user)

@router.post("/check-out/{booking_id}", response_model=BookingOut)
def record_check_out(
    booking_id: str,
    checkout_in: BookingCheckOut,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Alias endpoint for performing resource check-out."""
    return check_out_booking(db=db, booking_id=booking_id, checkout_in=checkout_in, user=current_user)
