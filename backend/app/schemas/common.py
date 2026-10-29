from typing import Optional
from pydantic import BaseModel

class MessageResponse(BaseModel):
    message: str
    detail: Optional[str] = None
