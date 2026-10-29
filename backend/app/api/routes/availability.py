from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.schemas.resource import AvailabilitySlotCreate, AvailabilitySlotOut
from app.schemas.common import MessageResponse
from app.core.dependencies import require_provider
from app.services.availability_service import (
    create_availability_slot,
    list_availability_slots,
    delete_availability_slot
)

router = APIRouter(prefix="/availability", tags=["availability"])

@router.get("/{resource_id}", response_model=List[AvailabilitySlotOut])
def get_slots(resource_id: str, db: Session = Depends(get_db)):
    """Retrieve all availability slots for a resource."""
    return list_availability_slots(db=db, resource_id=resource_id)

@router.post("/{resource_id}", response_model=AvailabilitySlotOut, status_code=status.HTTP_201_CREATED)
def add_slot(
    resource_id: str,
    slot_in: AvailabilitySlotCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_provider)
):
    """Add an availability window for a resource (Provider only)."""
    return create_availability_slot(
        db=db,
        resource_id=resource_id,
        slot_in=slot_in,
        current_user=current_user
    )

@router.delete("/slots/{slot_id}", response_model=MessageResponse)
def remove_slot(
    slot_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_provider)
):
    """Remove an availability slot (Provider only)."""
    delete_availability_slot(db=db, slot_id=slot_id, current_user=current_user)
    return MessageResponse(message="Availability slot deleted successfully.")
