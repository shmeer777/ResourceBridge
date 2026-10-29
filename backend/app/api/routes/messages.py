from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.core.dependencies import get_current_user
from app.schemas.message import MessageCreate, MessageOut, ConversationSummary
from app.services.message_service import (
    get_booking_messages,
    send_booking_message,
    list_user_conversations
)

router = APIRouter(prefix="/messages", tags=["messages"])

@router.get("/conversations", response_model=List[ConversationSummary])
def get_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all booking conversations for current user with unread counts."""
    return list_user_conversations(db=db, current_user=current_user)

@router.get("/{booking_id}", response_model=List[MessageOut])
def get_messages(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all messages for an authorized booking conversation."""
    return get_booking_messages(db=db, booking_id=booking_id, current_user=current_user)

@router.post("/{booking_id}", response_model=MessageOut, status_code=status.HTTP_201_CREATED)
def post_message(
    booking_id: str,
    message_in: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send a new message to an authorized booking conversation."""
    return send_booking_message(db=db, booking_id=booking_id, message_in=message_in, current_user=current_user)
