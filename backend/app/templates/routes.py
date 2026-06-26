"""Template API routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.auth.service import get_current_admin
from app.auth.models import AdminUser
from app.templates.schemas import (
    CreateTemplateRequest,
    UpdateTemplateRequest,
    TemplateResponse,
)
from app.templates import service

router = APIRouter(prefix="/api/templates", tags=["Templates"])


@router.get("", response_model=list[TemplateResponse])
async def list_templates(
    db: AsyncSession = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    """List all templates."""
    templates = await service.list_templates(db)
    return [TemplateResponse.model_validate(t) for t in templates]


@router.post("", response_model=TemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_template(
    request: CreateTemplateRequest,
    db: AsyncSession = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    """Create a new template."""
    template = await service.create_template(db, **request.model_dump())
    return TemplateResponse.model_validate(template)


@router.get("/{template_id}", response_model=TemplateResponse)
async def get_template(
    template_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    """Get template details."""
    template = await service.get_template(db, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return TemplateResponse.model_validate(template)


@router.put("/{template_id}", response_model=TemplateResponse)
async def update_template(
    template_id: int,
    request: UpdateTemplateRequest,
    db: AsyncSession = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    """Update a template."""
    template = await service.update_template(
        db, template_id, **request.model_dump(exclude_unset=True)
    )
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return TemplateResponse.model_validate(template)


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_template(
    template_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    """Delete a template."""
    if not await service.delete_template(db, template_id):
        raise HTTPException(status_code=404, detail="Template not found")
