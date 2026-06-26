"""Container request/response schemas."""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CreateContainerRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, pattern=r"^[a-zA-Z0-9_-]+$")
    username: str = Field(..., min_length=1, max_length=50, pattern=r"^[a-z_][a-z0-9_-]*$")
    password: str = Field(..., min_length=4, max_length=128)
    distro: str = Field(..., description="Linux distribution template key")
    cpu_limit: float = Field(default=1.0, ge=0.25, le=8.0)
    ram_limit: int = Field(default=512, ge=128, le=16384)
    storage_limit: int = Field(default=10, ge=1, le=100)
    ssh_enabled: bool = Field(default=False)
    lifetime_hours: Optional[int] = Field(default=None, ge=1, le=8760)
    template_id: Optional[int] = None


class UpdateContainerRequest(BaseModel):
    cpu_limit: Optional[float] = Field(default=None, ge=0.25, le=8.0)
    ram_limit: Optional[int] = Field(default=None, ge=128, le=16384)
    storage_limit: Optional[int] = Field(default=None, ge=1, le=100)
    ssh_enabled: Optional[bool] = None
    lifetime_hours: Optional[int] = Field(default=None, ge=1, le=8760)


class ContainerResponse(BaseModel):
    id: int
    name: str
    docker_id: Optional[str]
    username: str
    distro: str
    status: str
    cpu_limit: float
    ram_limit: int
    storage_limit: int
    ip_address: Optional[str]
    ssh_enabled: bool
    ssh_port: Optional[int]
    lifetime_hours: Optional[int]
    template_id: Optional[int]
    created_at: datetime
    last_active: datetime

    model_config = {"from_attributes": True}


class ContainerStatsResponse(BaseModel):
    container_id: int
    cpu_percent: float
    ram_used_mb: float
    ram_limit_mb: float
    ram_percent: float
    disk_used_mb: float
    disk_limit_mb: float
    disk_percent: float
    network_rx_bytes: int
    network_tx_bytes: int
    pids: int
    uptime_seconds: int


class ContainerListResponse(BaseModel):
    containers: list[ContainerResponse]
    total: int
    running: int
    stopped: int
