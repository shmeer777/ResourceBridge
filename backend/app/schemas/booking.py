from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

class BookingCreate(BaseModel):
    resource_id: str
    start_time: datetime
    end_time: datetime
    purpose: str = Field(..., min_length=3)

class BookingDecision(BaseModel):
    decision: str = Field(..., pattern="^(approve|reject)$")
    rejection_reason: Optional[str] = None

class BookingCheckIn(BaseModel):
    notes: Optional[str] = None
    condition_rating: Optional[str] = "good"  # "excellent", "good", "fair", "damaged"
    image_url: Optional[str] = None

class BookingCheckOut(BaseModel):
    notes: Optional[str] = None
    condition_rating: Optional[str] = "good"
    image_url: Optional[str] = None

class BookingOut(BaseModel):
    id: str
    resource_id: str
    seeker_id: str
    start_time: datetime
    end_time: datetime
    purpose: str
    status: str
    rejection_reason: Optional[str] = None
    checked_in_at: Optional[datetime] = None
    checked_out_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    resource_title: Optional[str] = None
    resource_location: Optional[str] = None
    resource_category: Optional[str] = None
    seeker_name: Optional[str] = None
    seeker_email: Optional[str] = None
    seeker_organization: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
