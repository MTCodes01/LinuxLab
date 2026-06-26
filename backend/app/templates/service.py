"""Template CRUD service."""

import logging
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.templates.models import Template

logger = logging.getLogger(__name__)


async def create_template(db: AsyncSession, **kwargs) -> Template:
    """Create a new template."""
    template = Template(**kwargs)
    db.add(template)
    await db.commit()
    await db.refresh(template)
    return template


async def get_template(db: AsyncSession, template_id: int) -> Optional[Template]:
    """Get a template by ID."""
    result = await db.execute(select(Template).where(Template.id == template_id))
    return result.scalar_one_or_none()


async def list_templates(db: AsyncSession) -> list[Template]:
    """List all templates."""
    result = await db.execute(select(Template).order_by(Template.name))
    return list(result.scalars().all())


async def update_template(db: AsyncSession, template_id: int, **kwargs) -> Optional[Template]:
    """Update a template."""
    template = await get_template(db, template_id)
    if not template:
        return None
    for key, value in kwargs.items():
        if value is not None:
            setattr(template, key, value)
    await db.commit()
    await db.refresh(template)
    return template


async def delete_template(db: AsyncSession, template_id: int) -> bool:
    """Delete a template."""
    template = await get_template(db, template_id)
    if not template:
        return False
    await db.delete(template)
    await db.commit()
    return True


async def seed_default_templates(db: AsyncSession) -> None:
    """Seed the database with default templates."""
    defaults = [
        {"name": "Ubuntu 24.04", "distro": "ubuntu-24.04", "icon": "🐧", "description": "Full Ubuntu desktop experience with essential tools", "default_cpu": 1.0, "default_ram": 1024, "default_storage": 10, "category": "General"},
        {"name": "Debian 12", "distro": "debian-12", "icon": "🌀", "description": "Stable Debian environment for server administration", "default_cpu": 1.0, "default_ram": 512, "default_storage": 10, "category": "General"},
        {"name": "Fedora", "distro": "fedora", "icon": "🎩", "description": "Cutting-edge Fedora with latest packages", "default_cpu": 1.0, "default_ram": 1024, "default_storage": 10, "category": "General"},
        {"name": "Alpine", "distro": "alpine", "icon": "🏔️", "description": "Minimal Alpine Linux — lightweight and fast", "default_cpu": 0.5, "default_ram": 256, "default_storage": 5, "category": "General"},
        {"name": "Arch Linux", "distro": "archlinux", "icon": "🔷", "description": "Rolling release Arch for advanced users", "default_cpu": 1.0, "default_ram": 1024, "default_storage": 10, "category": "General"},
        {"name": "Python Lab", "distro": "python-lab", "icon": "🐍", "description": "Python development environment with venv, IPython, Flask, Django", "default_cpu": 1.0, "default_ram": 1024, "default_storage": 15, "category": "Development"},
        {"name": "C Development Lab", "distro": "c-dev-lab", "icon": "⚙️", "description": "C/C++ development with GCC, GDB, Valgrind, CMake", "default_cpu": 2.0, "default_ram": 1024, "default_storage": 10, "category": "Development"},
        {"name": "Docker Learning Lab", "distro": "docker-learning-lab", "icon": "🐳", "description": "Learn Docker commands with pre-installed Docker CLI", "default_cpu": 1.0, "default_ram": 1024, "default_storage": 20, "category": "DevOps"},
    ]

    for tmpl in defaults:
        result = await db.execute(
            select(Template).where(Template.name == tmpl["name"])
        )
        existing = result.scalar_one_or_none()
        if not existing:
            db.add(Template(**tmpl))

    await db.commit()
