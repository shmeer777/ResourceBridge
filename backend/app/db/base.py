from sqlalchemy.orm import declarative_base

Base = declarative_base()

# Import all models here so that Base.metadata contains all tables
from app.models.user import User  # noqa: E402, F401
from app.models.organization import Organization  # noqa: E402, F401
from app.models.resource import Resource  # noqa: E402, F401
from app.models.availability import AvailabilitySlot  # noqa: E402, F401
from app.models.booking import Booking  # noqa: E402, F401
from app.models.condition_report import ConditionReport  # noqa: E402, F401
from app.models.incident import Incident  # noqa: E402, F401
from app.models.audit_event import AuditEvent  # noqa: E402, F401
from app.models.message import Message  # noqa: E402, F401
