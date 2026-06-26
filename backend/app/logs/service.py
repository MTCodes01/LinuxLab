"""Activity log service."""

import logging
from typing import Optional

from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.logs.models import ActivityLog

logger = logging.getLogger(__name__)


async def log_activity(
    db: AsyncSession,
    action: str,
    container_id: Optional[int] = None,
    container_name: Optional[str] = None,
    details: Optional[str] = None,
    ip_address: Optional[str] = None,
    user: Optional[str] = None,
) -> ActivityLog:
    """Record an activity log entry."""
    log_entry = ActivityLog(
        action=action,
        container_id=container_id,
        container_name=container_name,
        details=details,
        ip_address=ip_address,
        user=user,
    )
    db.add(log_entry)
    await db.commit()
    await db.refresh(log_entry)
    logger.info(f"Activity logged: {action} - {container_name or 'system'} - {details or ''}")
    return log_entry


async def list_logs(
    db: AsyncSession,
    limit: int = 50,
    offset: int = 0,
    action: Optional[str] = None,
    container_id: Optional[int] = None,
) -> tuple[list[ActivityLog], int]:
    """List activity logs with pagination and filtering."""
    query = select(ActivityLog)
    count_query = select(func.count(ActivityLog.id))

    if action:
        query = query.where(ActivityLog.action == action)
        count_query = count_query.where(ActivityLog.action == action)

    if container_id:
        query = query.where(ActivityLog.container_id == container_id)
        count_query = count_query.where(ActivityLog.container_id == container_id)

    # Get total count
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Get paginated results
    query = query.order_by(desc(ActivityLog.timestamp)).offset(offset).limit(limit)
    result = await db.execute(query)
    logs = list(result.scalars().all())

    return logs, total
