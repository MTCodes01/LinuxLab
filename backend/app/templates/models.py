"""Template database model."""

from datetime import datetime
from typing import Optional
from sqlalchemy import String, DateTime, Integer, Float, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Template(Base):
    """Reusable environment template configuration."""

    __tablename__ = "templates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    distro: Mapped[str] = mapped_column(String(50), nullable=False)
    icon: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # emoji or icon name
    default_cpu: Mapped[float] = mapped_column(Float, default=1.0)
    default_ram: Mapped[int] = mapped_column(Integer, default=512)  # MB
    default_storage: Mapped[int] = mapped_column(Integer, default=10)  # GB
    category: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
