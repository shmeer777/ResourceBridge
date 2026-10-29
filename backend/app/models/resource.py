import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Float, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class Resource(Base):
    __tablename__ = "resources"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    owner_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False, index=True)  # Equipment, Workspace, Lab, Tool, Computing, etc.
    location = Column(String(255), nullable=False)
    image_url = Column(String(1024), nullable=True)
    capacity = Column(Integer, default=1, nullable=False)
    status = Column(String(50), default="available", nullable=False)  # "available", "maintenance", "unavailable"
    hourly_rate = Column(Float, default=0.0, nullable=False)
    eligibility_criteria = Column(Text, nullable=True)  # E.g., Affiliation, prerequisite training, induction
    rules = Column(Text, nullable=True)  # Usage terms and safety guidelines
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    owner = relationship("User", back_populates="resources")
    availability_slots = relationship("AvailabilitySlot", back_populates="resource", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="resource", cascade="all, delete-orphan")
    reports = relationship("ConditionReport", back_populates="resource", cascade="all, delete-orphan")
