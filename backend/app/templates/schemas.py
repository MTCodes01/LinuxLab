"""Template request/response schemas."""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CreateTemplateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    distro: str
    icon: Optional[str] = None
    default_cpu: float = Field(default=1.0, ge=0.25, le=8.0)
    default_ram: int = Field(default=512, ge=128, le=16384)
    default_storage: int = Field(default=10, ge=1, le=100)
    category: Optional[str] = None


class UpdateTemplateRequest(BaseModel):
    name: Optional[str] = Field(default=None, max_length=100)
    description: Optional[str] = None
    icon: Optional[str] = None
    default_cpu: Optional[float] = Field(default=None, ge=0.25, le=8.0)
    default_ram: Optional[int] = Field(default=None, ge=128, le=16384)
    default_storage: Optional[int] = Field(default=None, ge=1, le=100)
    category: Optional[str] = None


class TemplateResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    distro: str
    icon: Optional[str]
    default_cpu: float
    default_ram: int
    default_storage: int
    category: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
