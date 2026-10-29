from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.models.booking import Booking
from app.models.resource import Resource
from app.models.user import User
from app.models.condition_report import ConditionReport
from app.schemas.booking import (
    BookingCreate,
    BookingDecision,
    BookingCheckIn,
    BookingCheckOut,
    BookingOut
)
from app.services.audit_service import log_audit_event
from app.services.fairness_service import check_seeker_fairness_quota

def _format_booking(b: Booking) -> BookingOut:
    return BookingOut(
        id=b.id,
        resource_id=b.resource_id,
        seeker_id=b.seeker_id,
        start_time=b.start_time,
        end_time=b.end_time,
        purpose=b.purpose,
        status=b.status,
        rejection_reason=b.rejection_reason,
        checked_in_at=b.checked_in_at,
        checked_out_at=b.checked_out_at,
        created_at=b.created_at,
        updated_at=b.updated_at,
        resource_title=b.resource.title if b.resource else None,
        resource_location=b.resource.location if b.resource else None,
        resource_category=b.resource.category if b.resource else None,
        seeker_name=b.seeker.full_name if b.seeker else None,
        seeker_email=b.seeker.email if b.seeker else None,
        seeker_organization=b.seeker.organization_name if b.seeker else None,
    )

def has_overlapping_approved_booking(
    db: Session,
    resource_id: str,
    start_time: datetime,
    end_time: datetime,
    exclude_booking_id: Optional[str] = None
) -> bool:
    """Check whether any approved or checked-in booking overlaps with the interval."""
    query = db.query(Booking).filter(
        Booking.resource_id == resource_id,
        Booking.status.in_(["approved", "checked_in"]),
        Booking.start_time < end_time,
        Booking.end_time > start_time
    )
    if exclude_booking_id:
        query = query.filter(Booking.id != exclude_booking_id)
    return query.first() is not None

def create_booking(db: Session, booking_in: BookingCreate, seeker: User) -> BookingOut:
    if booking_in.start_time >= booking_in.end_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start time must be before end time."
        )

    resource = db.query(Resource).filter(Resource.id == booking_in.resource_id).first()
    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found.")

    if resource.status != "available":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Resource is currently {resource.status} and cannot be booked."
        )

    if resource.owner_id == seeker.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot book your own resource."
        )

    # Check fairness limits
    check_seeker_fairness_quota(db, seeker, resource.id)

    # Check for conflict with already approved bookings
    if has_overlapping_approved_booking(db, resource.id, booking_in.start_time, booking_in.end_time):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This resource already has an approved reservation during the selected time period."
        )

    booking = Booking(
        resource_id=resource.id,
        seeker_id=seeker.id,
        start_time=booking_in.start_time,
        end_time=booking_in.end_time,
        purpose=booking_in.purpose,
        status="pending"
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    log_audit_event(
        db=db,
        action="BOOKING_REQUESTED",
        target_type="booking",
        target_id=booking.id,
        actor=seeker,
        details={"resource_id": resource.id, "resource_title": resource.title}
    )

    return _format_booking(booking)

def list_user_bookings(db: Session, user: User) -> List[BookingOut]:
    """Return bookings relevant to user (as seeker or as provider)."""
    if user.role == "provider":
        bookings = (
            db.query(Booking)
            .join(Resource, Booking.resource_id == Resource.id)
            .filter(Resource.owner_id == user.id)
            .order_by(Booking.created_at.desc())
            .all()
        )
    else:
        bookings = (
            db.query(Booking)
            .filter(Booking.seeker_id == user.id)
            .order_by(Booking.created_at.desc())
            .all()
        )
    return [_format_booking(b) for b in bookings]

def get_booking_by_id(db: Session, booking_id: str, user: User) -> BookingOut:
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found.")

    is_seeker = booking.seeker_id == user.id
    is_owner = booking.resource and booking.resource.owner_id == user.id
    if not (is_seeker or is_owner):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    return _format_booking(booking)

def decide_booking(
    db: Session,
    booking_id: str,
    decision_in: BookingDecision,
    provider: User
) -> BookingOut:
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")

    if not booking.resource or booking.resource.owner_id != provider.id:
        raise HTTPException(status_code=403, detail="Only the resource owner can approve or reject bookings.")

    if booking.status != "pending":
        raise HTTPException(status_code=400, detail=f"Cannot decide on booking with status '{booking.status}'.")

    if decision_in.decision == "approve":
        # Ensure no overlapping approved booking exists
        if has_overlapping_approved_booking(
            db, booking.resource_id, booking.start_time, booking.end_time, exclude_booking_id=booking.id
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Cannot approve: an overlapping booking has already been approved for this time slot."
            )
        booking.status = "approved"
        booking.rejection_reason = None
        action = "BOOKING_APPROVED"
    else:
        booking.status = "rejected"
        booking.rejection_reason = decision_in.rejection_reason or "Provider rejected the request."
        action = "BOOKING_REJECTED"

    db.commit()
    db.refresh(booking)

    log_audit_event(
        db=db,
        action=action,
        target_type="booking",
        target_id=booking.id,
        actor=provider,
        details={"decision": decision_in.decision, "reason": booking.rejection_reason}
    )

    return _format_booking(booking)

def cancel_booking(db: Session, booking_id: str, user: User) -> BookingOut:
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")

    is_seeker = booking.seeker_id == user.id
    is_owner = booking.resource and booking.resource.owner_id == user.id
    if not (is_seeker or is_owner):
        raise HTTPException(status_code=403, detail="Not authorized to cancel this booking.")

    if booking.status in ["cancelled", "completed", "rejected"]:
        raise HTTPException(status_code=400, detail=f"Booking is already {booking.status}.")

    booking.status = "cancelled"
    db.commit()
    db.refresh(booking)

    log_audit_event(
        db=db,
        action="BOOKING_CANCELLED",
        target_type="booking",
        target_id=booking.id,
        actor=user
    )

    return _format_booking(booking)

def check_in_booking(db: Session, booking_id: str, checkin_in: BookingCheckIn, user: User) -> BookingOut:
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")

    is_seeker = booking.seeker_id == user.id
    is_owner = booking.resource and booking.resource.owner_id == user.id
    if not (is_seeker or is_owner):
        raise HTTPException(status_code=403, detail="Not authorized.")

    if booking.status != "approved":
        raise HTTPException(
            status_code=400,
            detail=f"Only approved bookings can be checked in (current status: {booking.status})."
        )

    now = datetime.now(timezone.utc)
    booking.status = "checked_in"
    booking.checked_in_at = now

    # Record condition report
    notes = checkin_in.notes or f"Check-in recorded by {user.full_name}"
    report = ConditionReport(
        booking_id=booking.id,
        resource_id=booking.resource_id,
        reporter_id=user.id,
        report_type="check_in",
        condition_rating=checkin_in.condition_rating or "good",
        notes=notes,
        image_url=checkin_in.image_url
    )
    db.add(report)

    db.commit()
    db.refresh(booking)

    log_audit_event(
        db=db,
        action="BOOKING_CHECKED_IN",
        target_type="booking",
        target_id=booking.id,
        actor=user,
        details={"condition": checkin_in.condition_rating}
    )

    return _format_booking(booking)

def check_out_booking(db: Session, booking_id: str, checkout_in: BookingCheckOut, user: User) -> BookingOut:
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")

    is_seeker = booking.seeker_id == user.id
    is_owner = booking.resource and booking.resource.owner_id == user.id
    if not (is_seeker or is_owner):
        raise HTTPException(status_code=403, detail="Not authorized.")

    if booking.status != "checked_in":
        raise HTTPException(
            status_code=400,
            detail=f"Only checked-in bookings can be checked out (current status: {booking.status})."
        )

    now = datetime.now(timezone.utc)
    booking.status = "completed"
    booking.checked_out_at = now

    notes = checkout_in.notes or f"Check-out recorded by {user.full_name}"
    report = ConditionReport(
        booking_id=booking.id,
        resource_id=booking.resource_id,
        reporter_id=user.id,
        report_type="check_out",
        condition_rating=checkout_in.condition_rating or "good",
        notes=notes,
        image_url=checkout_in.image_url
    )
    db.add(report)

    db.commit()
    db.refresh(booking)

    log_audit_event(
        db=db,
        action="BOOKING_CHECKED_OUT",
        target_type="booking",
        target_id=booking.id,
        actor=user,
        details={"condition": checkout_in.condition_rating}
    )

    return _format_booking(booking)
