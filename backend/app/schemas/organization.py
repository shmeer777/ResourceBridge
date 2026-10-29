from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class OrganizationBase(BaseModel):
    name: str
    description: Optional[str] = None

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationOut(OrganizationBase):
    id: str
    owner_id: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
