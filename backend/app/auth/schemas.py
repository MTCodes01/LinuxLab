"""Auth request/response schemas."""

from pydantic import BaseModel
from datetime import datetime


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AdminUserResponse(BaseModel):
    id: int
    username: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
