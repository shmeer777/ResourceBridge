from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field

class AvailabilitySlotBase(BaseModel):
    start_time: datetime
    end_time: datetime
    is_available: bool = True

class AvailabilitySlotCreate(AvailabilitySlotBase):
    pass

class AvailabilitySlotOut(AvailabilitySlotBase):
    id: str
    resource_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ResourceBase(BaseModel):
    title: str = Field(..., min_length=2)
    description: str = Field(..., min_length=5)
    category: str = Field(..., min_length=2)
    location: str = Field(..., min_length=2)
    image_url: Optional[str] = None
    capacity: int = Field(default=1, ge=1)
    hourly_rate: float = Field(default=0.0, ge=0.0)
    eligibility_criteria: Optional[str] = None
    rules: Optional[str] = None
    status: str = Field(default="available")

class ResourceCreate(ResourceBase):
    pass

class ResourceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    image_url: Optional[str] = None
    capacity: Optional[int] = None
    hourly_rate: Optional[float] = None
    eligibility_criteria: Optional[str] = None
    rules: Optional[str] = None
    status: Optional[str] = None

class ResourceOut(ResourceBase):
    id: str
    owner_id: str
    created_at: datetime
    updated_at: datetime
    owner_name: Optional[str] = None
    organization_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class ResourceFilter(BaseModel):
    category: Optional[str] = None
    location: Optional[str] = None
    search: Optional[str] = None
    status: Optional[str] = None
