"""Authentication API routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.auth.schemas import LoginRequest, TokenResponse, AdminUserResponse
from app.auth.service import authenticate_admin, create_access_token, get_current_admin
from app.auth.models import AdminUser

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate admin and return JWT access token."""
    user = await authenticate_admin(request.username, request.password, db)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )
    access_token = create_access_token(data={"sub": user.username})
    return TokenResponse(access_token=access_token)


@router.get("/me", response_model=AdminUserResponse)
async def get_me(current_admin: AdminUser = Depends(get_current_admin)):
    """Return current admin user info."""
    return current_admin
