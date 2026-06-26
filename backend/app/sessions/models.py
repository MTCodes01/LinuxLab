"""Session tracking model."""

from datetime import datetime
from typing import Optional
from sqlalchemy import String, DateTime, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Session(Base):
    """Tracks active and historical terminal/SSH sessions."""

    __tablename__ = "sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    container_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("containers.id", ondelete="CASCADE"), nullable=False
    )
    session_type: Mapped[str] = mapped_column(String(20), nullable=False)  # "terminal" or "ssh"
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    ended_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
