from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from app.schemas.user import UserOut

VALID_ORGANIZATION_TYPES: List[str] = [
    "School",
    "College / University",
    "College or University",
    "Training Institute",
    "Research Institution",
    "Research Laboratory",
    "Hospital / Healthcare Institution",
    "Hospital or Healthcare Organisation",
    "Government Institution",
    "Government Organisation",
    "Non-Profit Organisation / NGO",
    "Non-profit Organisation",
    "Non-Profit Organisation",
    "Private Business",
    "Small Business",
    "Medium / Large Business",
    "Startup",
    "Manufacturing / Industrial Organisation",
    "Manufacturing or Industrial Facility",
    "Coworking Space",
    "Other",
]

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")
    full_name: str = Field(..., min_length=1, description="Full name or contact name")
    role: str = Field("seeker", pattern="^(provider|seeker)$", description="Role: provider or seeker")
    organization_name: Optional[str] = None
    organization_type: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    role: Optional[str] = None  # Optional check for role boundary

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
