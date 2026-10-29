from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.schemas.booking import (
    BookingCreate,
    BookingDecision,
    BookingCheckIn,
    BookingCheckOut,
    BookingOut
)
from app.schemas.message import MessageCreate, MessageOut, ConversationSummary
from app.core.dependencies import get_current_user, require_seeker, require_provider
from app.services.booking_service import (
    create_booking,
    list_user_bookings,
    get_booking_by_id,
    decide_booking,
    cancel_booking,
    check_in_booking,
    check_out_booking
)
from app.services.message_service import (
    get_booking_messages,
    send_booking_message,
    list_user_conversations
)

router = APIRouter(prefix="/bookings", tags=["bookings"])

@router.post("", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
def request_booking(
    booking_in: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_seeker)
):
    """Submit a booking request for a resource (Seeker only)."""
    return create_booking(db=db, booking_in=booking_in, seeker=current_user)

@router.get("/my", response_model=List[BookingOut])
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List bookings for current user (as seeker or provider)."""
    return list_user_bookings(db=db, user=current_user)

@router.get("/conversations", response_model=List[ConversationSummary])
def get_booking_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all booking conversations for current user with unread message counts."""
    return list_user_conversations(db=db, current_user=current_user)

@router.get("/{booking_id}", response_model=BookingOut)
def get_single_booking(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get details of a specific booking."""
    return get_booking_by_id(db=db, booking_id=booking_id, user=current_user)

@router.patch("/{booking_id}/decision", response_model=BookingOut)
def decide_booking_request(
    booking_id: str,
    decision_in: BookingDecision,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_provider)
):
    """Approve or reject a booking request (Resource owner only)."""
    return decide_booking(
        db=db,
        booking_id=booking_id,
        decision_in=decision_in,
        provider=current_user
    )

@router.post("/{booking_id}/cancel", response_model=BookingOut)
def cancel_booking_request(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cancel a pending or approved booking."""
    return cancel_booking(db=db, booking_id=booking_id, user=current_user)

@router.post("/{booking_id}/check-in", response_model=BookingOut)
def check_in(
    booking_id: str,
    checkin_in: BookingCheckIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Perform check-in and record starting condition report."""
    return check_in_booking(
        db=db,
        booking_id=booking_id,
        checkin_in=checkin_in,
        user=current_user
    )

@router.post("/{booking_id}/check-out", response_model=BookingOut)
def check_out(
    booking_id: str,
    checkout_in: BookingCheckOut,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Perform check-out and record ending condition report."""
    return check_out_booking(
        db=db,
        booking_id=booking_id,
        checkout_in=checkout_in,
        user=current_user
    )

@router.get("/{booking_id}/messages", response_model=List[MessageOut])
def get_booking_messages_route(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all messages for an authorized booking conversation."""
    return get_booking_messages(db=db, booking_id=booking_id, current_user=current_user)

@router.post("/{booking_id}/messages", response_model=MessageOut, status_code=status.HTTP_201_CREATED)
def post_booking_message_route(
    booking_id: str,
    message_in: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send a new message to an authorized booking conversation."""
    return send_booking_message(db=db, booking_id=booking_id, message_in=message_in, current_user=current_user)
