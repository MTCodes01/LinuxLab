"""Container database model."""

from datetime import datetime
from typing import Optional
from sqlalchemy import String, Boolean, DateTime, Integer, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Container(Base):
    """A managed Linux container environment."""

    __tablename__ = "containers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    docker_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    username: Mapped[str] = mapped_column(String(50), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    password_plain: Mapped[str] = mapped_column(String(255), nullable=False)  # Stored for reset
    distro: Mapped[str] = mapped_column(String(50), nullable=False)
    image_name: Mapped[str] = mapped_column(String(200), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="stopped")
    cpu_limit: Mapped[float] = mapped_column(Float, default=1.0)
    ram_limit: Mapped[int] = mapped_column(Integer, default=512)  # MB
    storage_limit: Mapped[int] = mapped_column(Integer, default=10)  # GB
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    ssh_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    ssh_port: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    lifetime_hours: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    template_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("templates.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    last_active: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
