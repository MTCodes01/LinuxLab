"""Session schemas."""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SessionResponse(BaseModel):
    id: int
    container_id: int
    session_type: str
    ip_address: Optional[str]
    started_at: datetime
    ended_at: Optional[datetime]

    model_config = {"from_attributes": True}


class SessionListResponse(BaseModel):
    sessions: list[SessionResponse]
    total: int
    active: int
