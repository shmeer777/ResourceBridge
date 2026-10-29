from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc

from app.models.booking import Booking
from app.models.message import Message
from app.models.user import User
from app.models.resource import Resource
from app.schemas.message import MessageCreate, MessageOut, ConversationSummary
from app.services.audit_service import log_audit_event

def _check_booking_authorization(booking: Booking, current_user: User) -> None:
    is_seeker = booking.seeker_id == current_user.id
    is_provider = booking.resource and booking.resource.owner_id == current_user.id

    if not (is_seeker or is_provider):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to access conversations for this booking."
        )

def get_booking_messages(
    db: Session,
    booking_id: str,
    current_user: User
) -> List[MessageOut]:
    booking = db.query(Booking).options(
        joinedload(Booking.resource),
        joinedload(Booking.seeker)
    ).filter(Booking.id == booking_id).first()

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking request not found."
        )

    _check_booking_authorization(booking, current_user)

    # Retrieve all messages for this booking
    messages = db.query(Message).options(
        joinedload(Message.sender)
    ).filter(
        Message.booking_id == booking_id
    ).order_by(Message.created_at.asc()).all()

    # Mark unread messages sent by the other party as read
    unread_found = False
    for msg in messages:
        if msg.sender_id != current_user.id and not msg.is_read:
            msg.is_read = True
            unread_found = True

    if unread_found:
        db.commit()

    return [
        MessageOut(
            id=msg.id,
            booking_id=msg.booking_id,
            sender_id=msg.sender_id,
            sender_name=msg.sender.full_name if msg.sender else "Unknown User",
            sender_role=msg.sender.role if msg.sender else "user",
            content=msg.content,
            is_read=msg.is_read,
            created_at=msg.created_at
        )
        for msg in messages
    ]

def send_booking_message(
    db: Session,
    booking_id: str,
    message_in: MessageCreate,
    current_user: User
) -> MessageOut:
    booking = db.query(Booking).options(
        joinedload(Booking.resource),
        joinedload(Booking.seeker)
    ).filter(Booking.id == booking_id).first()

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking request not found."
        )

    _check_booking_authorization(booking, current_user)

    clean_content = message_in.content.strip()
    if not clean_content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message content cannot be empty."
        )

    # Create message — preserving booking status
    new_message = Message(
        booking_id=booking.id,
        sender_id=current_user.id,
        content=clean_content,
        is_read=False
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    # Audit log
    log_audit_event(
        db=db,
        action="BOOKING_MESSAGE_SENT",
        target_type="booking",
        target_id=booking.id,
        actor=current_user,
        details={"message_id": new_message.id}
    )

    return MessageOut(
        id=new_message.id,
        booking_id=new_message.booking_id,
        sender_id=new_message.sender_id,
        sender_name=current_user.full_name,
        sender_role=current_user.role,
        content=new_message.content,
        is_read=new_message.is_read,
        created_at=new_message.created_at
    )

def list_user_conversations(
    db: Session,
    current_user: User
) -> List[ConversationSummary]:
    if current_user.role == "provider":
        bookings = db.query(Booking).join(Resource).options(
            joinedload(Booking.resource).joinedload(Resource.owner),
            joinedload(Booking.seeker),
            joinedload(Booking.messages).joinedload(Message.sender)
        ).filter(Resource.owner_id == current_user.id).all()
    else:
        bookings = db.query(Booking).options(
            joinedload(Booking.resource).joinedload(Resource.owner),
            joinedload(Booking.seeker),
            joinedload(Booking.messages).joinedload(Message.sender)
        ).filter(Booking.seeker_id == current_user.id).all()

    conversations: List[ConversationSummary] = []
    for b in bookings:
        total = len(b.messages)
        unread = sum(1 for m in b.messages if m.sender_id != current_user.id and not m.is_read)
        last_msg: Optional[Message] = b.messages[-1] if b.messages else None

        conversations.append(
            ConversationSummary(
                booking_id=b.id,
                resource_id=b.resource_id,
                resource_title=b.resource.title if b.resource else "Resource",
                seeker_id=b.seeker_id,
                seeker_name=b.seeker.full_name if b.seeker else "Seeker",
                seeker_email=b.seeker.email if b.seeker else "",
                provider_id=b.resource.owner_id if b.resource else "",
                provider_name=b.resource.owner.full_name if (b.resource and b.resource.owner) else "Provider",
                booking_status=b.status,
                booking_start_time=b.start_time,
                booking_end_time=b.end_time,
                last_message_content=last_msg.content if last_msg else None,
                last_message_at=last_msg.created_at if last_msg else None,
                last_message_sender_role=last_msg.sender.role if (last_msg and last_msg.sender) else None,
                unread_count=unread,
                total_messages=total
            )
        )

    # Sort conversations by last_message_at DESC, or booking creation time
    conversations.sort(
        key=lambda c: c.last_message_at.isoformat() if c.last_message_at else c.booking_start_time.isoformat(),
        reverse=True
    )
    return conversations
