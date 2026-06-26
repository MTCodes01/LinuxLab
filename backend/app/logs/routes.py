"""Activity log API routes."""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.auth.service import get_current_admin
from app.auth.models import AdminUser
from app.logs.schemas import ActivityLogResponse, ActivityLogListResponse
from app.logs import service

router = APIRouter(prefix="/api/logs", tags=["Activity Logs"])


@router.get("", response_model=ActivityLogListResponse)
async def list_logs(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    action: Optional[str] = Query(default=None),
    container_id: Optional[int] = Query(default=None),
    db: AsyncSession = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    """List activity logs with pagination and filtering."""
    logs, total = await service.list_logs(db, limit=limit, offset=offset, action=action, container_id=container_id)
    return ActivityLogListResponse(
        logs=[ActivityLogResponse.model_validate(log) for log in logs],
        total=total,
    )
