"""Session API routes."""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.auth.service import get_current_admin
from app.auth.models import AdminUser
from app.sessions.schemas import SessionResponse, SessionListResponse
from app.sessions import service

router = APIRouter(prefix="/api/sessions", tags=["Sessions"])


@router.get("", response_model=SessionListResponse)
async def list_sessions(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    active_only: bool = Query(default=False),
    container_id: Optional[int] = Query(default=None),
    db: AsyncSession = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    """List sessions with pagination and filtering."""
    sessions, total, active = await service.list_sessions(
        db, limit=limit, offset=offset, active_only=active_only, container_id=container_id
    )
    return SessionListResponse(
        sessions=[SessionResponse.model_validate(s) for s in sessions],
        total=total,
        active=active,
    )
