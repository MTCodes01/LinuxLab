"""Session tracking service."""

from datetime import datetime
from typing import Optional

from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession as DBSession

from app.sessions.models import Session


async def create_session(
    db: DBSession,
    container_id: int,
    session_type: str,
    ip_address: Optional[str] = None,
) -> Session:
    """Create a new session record."""
    session = Session(
        container_id=container_id,
        session_type=session_type,
        ip_address=ip_address,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


async def end_session(db: DBSession, session_id: int) -> None:
    """Mark a session as ended."""
    result = await db.execute(select(Session).where(Session.id == session_id))
    session = result.scalar_one_or_none()
    if session:
        session.ended_at = datetime.utcnow()
        await db.commit()


async def list_sessions(
    db: DBSession,
    limit: int = 50,
    offset: int = 0,
    active_only: bool = False,
    container_id: Optional[int] = None,
) -> tuple[list[Session], int, int]:
    """List sessions with pagination. Returns (sessions, total, active_count)."""
    query = select(Session)
    count_query = select(func.count(Session.id))
    active_query = select(func.count(Session.id)).where(Session.ended_at.is_(None))

    if active_only:
        query = query.where(Session.ended_at.is_(None))
        count_query = count_query.where(Session.ended_at.is_(None))

    if container_id:
        query = query.where(Session.container_id == container_id)
        count_query = count_query.where(Session.container_id == container_id)
        active_query = active_query.where(Session.container_id == container_id)

    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    active_result = await db.execute(active_query)
    active = active_result.scalar() or 0

    query = query.order_by(desc(Session.started_at)).offset(offset).limit(limit)
    result = await db.execute(query)
    sessions = list(result.scalars().all())

    return sessions, total, active
