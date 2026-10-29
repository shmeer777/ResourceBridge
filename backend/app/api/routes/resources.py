from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.schemas.resource import (
    ResourceCreate,
    ResourceUpdate,
    ResourceOut,
    AvailabilitySlotCreate,
    AvailabilitySlotOut
)
from app.schemas.common import MessageResponse
from app.core.dependencies import get_current_user, require_provider
from app.services.resource_service import (
    create_resource,
    list_resources,
    get_resource_by_id,
    update_resource,
    delete_resource,
    add_availability_slot,
    get_availability_slots
)

router = APIRouter(prefix="/resources", tags=["resources"])

@router.get("", response_model=List[ResourceOut])
def get_resources(
    category: Optional[str] = Query(None, description="Filter by category"),
    location: Optional[str] = Query(None, description="Filter by location"),
    search: Optional[str] = Query(None, description="Search keyword in title or description"),
    status: Optional[str] = Query(None, description="Filter by status (available, maintenance, etc.)"),
    owner_id: Optional[str] = Query(None, description="Filter by owner user ID"),
    db: Session = Depends(get_db)
):
    """Browse and search shared resources."""
    return list_resources(
        db=db,
        category=category,
        location=location,
        search=search,
        status_filter=status,
        owner_id=owner_id
    )

@router.post("", response_model=ResourceOut, status_code=status.HTTP_201_CREATED)
def post_resource(
    resource_in: ResourceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_provider)
):
    """Create a new resource listing (Provider only)."""
    return create_resource(db=db, resource_in=resource_in, current_user=current_user)

@router.get("/my", response_model=List[ResourceOut])
def get_my_resources(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_provider)
):
    """Get all resources owned by the currently logged-in provider."""
    return list_resources(db=db, owner_id=current_user.id)

@router.get("/{resource_id}", response_model=ResourceOut)
def get_single_resource(
    resource_id: str,
    db: Session = Depends(get_db)
):
    """Get details of a specific resource."""
    return get_resource_by_id(db=db, resource_id=resource_id)

@router.patch("/{resource_id}", response_model=ResourceOut)
def patch_resource(
    resource_id: str,
    update_data: ResourceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_provider)
):
    """Update a resource listing (Owner only)."""
    return update_resource(
        db=db,
        resource_id=resource_id,
        update_data=update_data,
        current_user=current_user
    )

@router.delete("/{resource_id}", response_model=MessageResponse)
def remove_resource(
    resource_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_provider)
):
    """Delete a resource listing (Owner only)."""
    delete_resource(db=db, resource_id=resource_id, current_user=current_user)
    return MessageResponse(message="Resource deleted successfully.")

@router.get("/{resource_id}/availability", response_model=List[AvailabilitySlotOut])
def get_resource_availability(
    resource_id: str,
    db: Session = Depends(get_db)
):
    """Get availability slots for a resource."""
    return get_availability_slots(db=db, resource_id=resource_id)

@router.post("/{resource_id}/availability", response_model=AvailabilitySlotOut, status_code=status.HTTP_201_CREATED)
def post_availability_slot(
    resource_id: str,
    slot_in: AvailabilitySlotCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_provider)
):
    """Add an availability window for a resource (Owner only)."""
    return add_availability_slot(
        db=db,
        resource_id=resource_id,
        slot_in=slot_in,
        current_user=current_user
    )
