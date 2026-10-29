import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    resource_id = Column(String(36), ForeignKey("resources.id", ondelete="CASCADE"), nullable=False, index=True)
    seeker_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    purpose = Column(Text, nullable=False)
    status = Column(String(50), default="pending", nullable=False, index=True)
    # Statuses: "pending", "approved", "rejected", "cancelled", "checked_in", "completed"
    rejection_reason = Column(Text, nullable=True)
    checked_in_at = Column(DateTime, nullable=True)
    checked_out_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    resource = relationship("Resource", back_populates="bookings")
    seeker = relationship("User", back_populates="bookings")
    condition_reports = relationship("ConditionReport", back_populates="booking", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="booking", cascade="all, delete-orphan", order_by="Message.created_at")
