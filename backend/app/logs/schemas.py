"""Activity log schemas."""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ActivityLogResponse(BaseModel):
    id: int
    action: str
    container_id: Optional[int]
    container_name: Optional[str]
    details: Optional[str]
    ip_address: Optional[str]
    user: Optional[str]
    timestamp: datetime

    model_config = {"from_attributes": True}


class ActivityLogListResponse(BaseModel):
    logs: list[ActivityLogResponse]
    total: int
