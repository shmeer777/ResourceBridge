import json
from typing import Optional, Any
from sqlalchemy.orm import Session
from app.models.audit_event import AuditEvent
from app.models.user import User

def log_audit_event(
    db: Session,
    action: str,
    target_type: str,
    target_id: str,
    actor: Optional[User] = None,
    details: Optional[Any] = None
) -> AuditEvent:
    """Safely record an audit trail event for actions in ResourceBridge."""
    details_str = None
    if details is not None:
        if isinstance(details, (dict, list)):
            try:
                details_str = json.dumps(details)
            except Exception:
                details_str = str(details)
        else:
            details_str = str(details)

    event = AuditEvent(
        actor_id=actor.id if actor else None,
        actor_email=actor.email if actor else "system",
        action=action,
        target_type=target_type,
        target_id=target_id,
        details=details_str
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event
