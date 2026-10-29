import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class ConditionReport(Base):
    __tablename__ = "condition_reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    booking_id = Column(String(36), ForeignKey("bookings.id", ondelete="SET NULL"), nullable=True, index=True)
    resource_id = Column(String(36), ForeignKey("resources.id", ondelete="CASCADE"), nullable=False, index=True)
    reporter_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    report_type = Column(String(50), nullable=False)  # "check_in", "check_out", "incident", "general"
    condition_rating = Column(String(50), nullable=False)  # "excellent", "good", "fair", "damaged"
    notes = Column(Text, nullable=False)
    image_url = Column(String(1024), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    booking = relationship("Booking", back_populates="condition_reports")
    resource = relationship("Resource", back_populates="reports")
    reporter = relationship("User", back_populates="reports")
