"""Container management API routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.auth.service import get_current_admin
from app.auth.models import AdminUser
from app.containers.schemas import (
    CreateContainerRequest,
    ContainerResponse,
    ContainerStatsResponse,
    ContainerListResponse,
)
from app.containers import service

router = APIRouter(prefix="/api/containers", tags=["Containers"])


@router.get("", response_model=ContainerListResponse)
async def list_containers(
    db: AsyncSession = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    """List all managed containers."""
    containers = await service.list_containers(db)
    running = sum(1 for c in containers if c.status == "running")
    stopped = len(containers) - running
    return ContainerListResponse(
        containers=[ContainerResponse.model_validate(c) for c in containers],
        total=len(containers),
        running=running,
        stopped=stopped,
    )


@router.post("", response_model=ContainerResponse, status_code=status.HTTP_201_CREATED)
async def create_container(
    request: CreateContainerRequest,
    db: AsyncSession = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    """Create a new container environment."""
    try:
        container = await service.create_container(
            db=db,
            name=request.name,
            username=request.username,
            password=request.password,
            distro=request.distro,
            cpu_limit=request.cpu_limit,
            ram_limit=request.ram_limit,
            storage_limit=request.storage_limit,
            ssh_enabled=request.ssh_enabled,
            lifetime_hours=request.lifetime_hours,
            template_id=request.template_id,
        )
        return ContainerResponse.model_validate(container)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{container_id}", response_model=ContainerResponse)
async def get_container(
    container_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    """Get container details."""
    container = await service.get_container(db, container_id)
    # Sync with Docker state
    container = await service.sync_container_status(db, container_id)
    return ContainerResponse.model_validate(container)


@router.delete("/{container_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_container(
    container_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    """Delete a container permanently."""
    await service.delete_container(db, container_id)


@router.post("/{container_id}/start", response_model=ContainerResponse)
async def start_container(
    container_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    """Start a stopped container."""
    container = await service.start_container(db, container_id)
    return ContainerResponse.model_validate(container)


@router.post("/{container_id}/stop", response_model=ContainerResponse)
async def stop_container(
    container_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    """Stop a running container."""
    container = await service.stop_container(db, container_id)
    return ContainerResponse.model_validate(container)


@router.post("/{container_id}/restart", response_model=ContainerResponse)
async def restart_container(
    container_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    """Restart a container."""
    container = await service.restart_container(db, container_id)
    return ContainerResponse.model_validate(container)


@router.post("/{container_id}/reset", response_model=ContainerResponse)
async def reset_container(
    container_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    """Reset container to fresh state (destroys and recreates)."""
    container = await service.reset_container(db, container_id)
    return ContainerResponse.model_validate(container)


@router.get("/{container_id}/stats", response_model=ContainerStatsResponse)
async def get_container_stats(
    container_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    """Get real-time resource stats for a container."""
    stats = await service.get_container_stats(container_id, db)
    return ContainerStatsResponse(**stats)
