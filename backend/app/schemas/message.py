from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator, ConfigDict

class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000, description="Message text content")

    @field_validator("content")
    @classmethod
    def validate_content_not_empty(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Message content cannot be empty or whitespace only.")
        return stripped

class MessageOut(BaseModel):
    id: str
    booking_id: str
    sender_id: str
    sender_name: str
    sender_role: str
    content: str
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ConversationSummary(BaseModel):
    booking_id: str
    resource_id: str
    resource_title: str
    seeker_id: str
    seeker_name: str
    seeker_email: str
    provider_id: str
    provider_name: str
    booking_status: str
    booking_start_time: datetime
    booking_end_time: datetime
    last_message_content: Optional[str] = None
    last_message_at: Optional[datetime] = None
    last_message_sender_role: Optional[str] = None
    unread_count: int = 0
    total_messages: int = 0

    model_config = ConfigDict(from_attributes=True)
