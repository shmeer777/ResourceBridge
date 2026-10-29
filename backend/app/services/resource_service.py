from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.resource import Resource
from app.models.availability import AvailabilitySlot
from app.models.user import User
from app.schemas.resource import ResourceCreate, ResourceUpdate, ResourceOut, AvailabilitySlotCreate
from app.core.permissions import verify_resource_ownership
from app.services.audit_service import log_audit_event

def _format_resource(res: Resource) -> ResourceOut:
    owner_name = res.owner.full_name if res.owner else None
    org_name = res.owner.organization_name if res.owner else None
    return ResourceOut(
        id=res.id,
        owner_id=res.owner_id,
        title=res.title,
        description=res.description,
        category=res.category,
        location=res.location,
        image_url=res.image_url,
        capacity=res.capacity,
        hourly_rate=res.hourly_rate,
        eligibility_criteria=res.eligibility_criteria,
        rules=res.rules,
        status=res.status,
        created_at=res.created_at,
        updated_at=res.updated_at,
        owner_name=owner_name,
        organization_name=org_name
    )

def create_resource(db: Session, resource_in: ResourceCreate, current_user: User) -> ResourceOut:
    resource = Resource(
        owner_id=current_user.id,
        title=resource_in.title,
        description=resource_in.description,
        category=resource_in.category,
        location=resource_in.location,
        image_url=resource_in.image_url,
        capacity=resource_in.capacity,
        hourly_rate=resource_in.hourly_rate,
        eligibility_criteria=resource_in.eligibility_criteria,
        rules=resource_in.rules,
        status=resource_in.status or "available"
    )
    db.add(resource)
    db.commit()
    db.refresh(resource)

    log_audit_event(
        db=db,
        action="RESOURCE_CREATED",
        target_type="resource",
        target_id=resource.id,
        actor=current_user,
        details={"title": resource.title, "category": resource.category}
    )

    return _format_resource(resource)

def list_resources(
    db: Session,
    category: Optional[str] = None,
    location: Optional[str] = None,
    search: Optional[str] = None,
    status_filter: Optional[str] = None,
    owner_id: Optional[str] = None
) -> List[ResourceOut]:
    query = db.query(Resource)

    if owner_id:
        query = query.filter(Resource.owner_id == owner_id)
    if category:
        query = query.filter(Resource.category.ilike(f"%{category}%"))
    if location:
        query = query.filter(Resource.location.ilike(f"%{location}%"))
    if status_filter:
        query = query.filter(Resource.status == status_filter)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Resource.title.ilike(search_pattern),
                Resource.description.ilike(search_pattern),
                Resource.category.ilike(search_pattern),
                Resource.location.ilike(search_pattern)
            )
        )

    resources = query.order_by(Resource.created_at.desc()).all()
    return [_format_resource(r) for r in resources]

def get_resource_by_id(db: Session, resource_id: str) -> ResourceOut:
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found."
        )
    return _format_resource(resource)

def update_resource(
    db: Session,
    resource_id: str,
    update_data: ResourceUpdate,
    current_user: User
) -> ResourceOut:
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found.")

    verify_resource_ownership(resource, current_user)

    data = update_data.model_dump(exclude_unset=True)
    for field, val in data.items():
        setattr(resource, field, val)

    db.commit()
    db.refresh(resource)

    log_audit_event(
        db=db,
        action="RESOURCE_UPDATED",
        target_type="resource",
        target_id=resource.id,
        actor=current_user,
        details=data
    )

    return _format_resource(resource)

def delete_resource(db: Session, resource_id: str, current_user: User) -> None:
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found.")

    verify_resource_ownership(resource, current_user)

    db.delete(resource)
    db.commit()

    log_audit_event(
        db=db,
        action="RESOURCE_DELETED",
        target_type="resource",
        target_id=resource_id,
        actor=current_user
    )

def add_availability_slot(
    db: Session,
    resource_id: str,
    slot_in: AvailabilitySlotCreate,
    current_user: User
) -> AvailabilitySlot:
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found.")
    verify_resource_ownership(resource, current_user)

    slot = AvailabilitySlot(
        resource_id=resource_id,
        start_time=slot_in.start_time,
        end_time=slot_in.end_time,
        is_available=slot_in.is_available
    )
    db.add(slot)
    db.commit()
    db.refresh(slot)
    return slot

def get_availability_slots(db: Session, resource_id: str) -> List[AvailabilitySlot]:
    return db.query(AvailabilitySlot).filter(
        AvailabilitySlot.resource_id == resource_id
    ).order_by(AvailabilitySlot.start_time.asc()).all()
