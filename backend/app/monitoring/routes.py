"""Monitoring API routes for aggregate system stats."""

from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.auth.service import get_current_admin
from app.auth.models import AdminUser
from app.containers.models import Container

router = APIRouter(prefix="/api/monitoring", tags=["Monitoring"])


@router.get("/overview")
async def get_system_overview(
    db: AsyncSession = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    """Get aggregate system stats for the dashboard."""
    # Count containers by status
    total_result = await db.execute(select(func.count(Container.id)))
    total = total_result.scalar() or 0

    running_result = await db.execute(
        select(func.count(Container.id)).where(Container.status == "running")
    )
    running = running_result.scalar() or 0

    stopped = total - running

    # Aggregate resource allocation
    cpu_result = await db.execute(select(func.sum(Container.cpu_limit)))
    total_cpu = cpu_result.scalar() or 0

    ram_result = await db.execute(select(func.sum(Container.ram_limit)))
    total_ram = ram_result.scalar() or 0

    storage_result = await db.execute(select(func.sum(Container.storage_limit)))
    total_storage = storage_result.scalar() or 0

    return {
        "total_containers": total,
        "running_containers": running,
        "stopped_containers": stopped,
        "total_cpu_allocated": round(total_cpu, 1),
        "total_ram_allocated_mb": total_ram,
        "total_storage_allocated_gb": total_storage,
    }
