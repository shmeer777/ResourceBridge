from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

class ConditionReportCreate(BaseModel):
    booking_id: Optional[str] = None
    resource_id: str
    report_type: str = Field(..., pattern="^(check_in|check_out|incident|general)$")
    condition_rating: str = Field(..., pattern="^(excellent|good|fair|damaged)$")
    notes: str = Field(..., min_length=2)
    image_url: Optional[str] = None

class ConditionReportOut(ConditionReportCreate):
    id: str
    reporter_id: str
    reporter_name: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class IncidentCreate(BaseModel):
    booking_id: Optional[str] = None
    resource_id: str
    severity: str = Field("medium", pattern="^(low|medium|high|critical)$")
    description: str = Field(..., min_length=5)

class IncidentOut(IncidentCreate):
    id: str
    reporter_id: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
