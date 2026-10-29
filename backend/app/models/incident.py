import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from app.db.base import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    booking_id = Column(String(36), ForeignKey("bookings.id", ondelete="SET NULL"), nullable=True, index=True)
    resource_id = Column(String(36), ForeignKey("resources.id", ondelete="CASCADE"), nullable=False, index=True)
    reporter_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    severity = Column(String(50), nullable=False, default="medium")  # "low", "medium", "high", "critical"
    description = Column(Text, nullable=False)
    status = Column(String(50), default="open", nullable=False)  # "open", "investigating", "resolved"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
