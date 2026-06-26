"""Activity log database model."""

from datetime import datetime
from typing import Optional
from sqlalchemy import String, DateTime, Integer, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class ActivityLog(Base):
    """Records all significant events in the system."""

    __tablename__ = "activity_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    action: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    container_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("containers.id", ondelete="SET NULL"), nullable=True
    )
    container_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    user: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
