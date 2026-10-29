from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

from app.db.session import get_db
from app.models.audit_event import AuditEvent
from app.models.resource import Resource
from app.models.user import User
from app.core.dependencies import get_current_user
from app.core.permissions import verify_resource_ownership

router = APIRouter(prefix="/audit", tags=["audit"])

class AuditEventOut(BaseModel):
    id: str
    actor_id: Optional[str] = None
    actor_email: Optional[str] = None
    action: str
    target_type: str
    target_id: str
    details: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

@router.get("/{resource_id}", response_model=List[AuditEventOut])
def get_resource_audit_history(
    resource_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve the audit trail for a resource (Resource owner or authorized user)."""
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if resource:
        verify_resource_ownership(resource, current_user)

    events = (
        db.query(AuditEvent)
        .filter(AuditEvent.target_id == resource_id)
        .order_by(AuditEvent.created_at.desc())
        .all()
    )
    return [AuditEventOut.model_validate(e) for e in events]
