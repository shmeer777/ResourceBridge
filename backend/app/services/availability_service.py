from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.availability import AvailabilitySlot
from app.models.resource import Resource
from app.models.user import User
from app.schemas.resource import AvailabilitySlotCreate, AvailabilitySlotOut
from app.core.permissions import verify_resource_ownership

def create_availability_slot(
    db: Session,
    resource_id: str,
    slot_in: AvailabilitySlotCreate,
    current_user: User
) -> AvailabilitySlotOut:
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found.")

    verify_resource_ownership(resource, current_user)

    if slot_in.start_time >= slot_in.end_time:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Start time must be before end time.")

    slot = AvailabilitySlot(
        resource_id=resource_id,
        start_time=slot_in.start_time,
        end_time=slot_in.end_time,
        is_available=slot_in.is_available
    )
    db.add(slot)
    db.commit()
    db.refresh(slot)

    return AvailabilitySlotOut.model_validate(slot)

def list_availability_slots(
    db: Session,
    resource_id: str
) -> List[AvailabilitySlotOut]:
    slots = (
        db.query(AvailabilitySlot)
        .filter(AvailabilitySlot.resource_id == resource_id)
        .order_by(AvailabilitySlot.start_time.asc())
        .all()
    )
    return [AvailabilitySlotOut.model_validate(s) for s in slots]

def delete_availability_slot(
    db: Session,
    slot_id: str,
    current_user: User
) -> None:
    slot = db.query(AvailabilitySlot).filter(AvailabilitySlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Slot not found.")

    resource = db.query(Resource).filter(Resource.id == slot.resource_id).first()
    if resource:
        verify_resource_ownership(resource, current_user)

    db.delete(slot)
    db.commit()
