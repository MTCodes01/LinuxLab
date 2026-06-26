"""FastAPI application factory and startup configuration."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db, async_session

# Import all models to register them with SQLAlchemy
from app.auth.models import AdminUser  # noqa: F401
from app.containers.models import Container  # noqa: F401
from app.templates.models import Template  # noqa: F401
from app.logs.models import ActivityLog  # noqa: F401
from app.sessions.models import Session  # noqa: F401

# Import routers
from app.auth.routes import router as auth_router
from app.containers.routes import router as containers_router
from app.templates.routes import router as templates_router
from app.logs.routes import router as logs_router
from app.sessions.routes import router as sessions_router
from app.monitoring.routes import router as monitoring_router
from app.terminal.websocket import router as terminal_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown events."""
    # ─── Startup ───────────────────────────────────────
    logger.info("🚀 Starting LinuxLab...")

    # Initialize database tables
    await init_db()
    logger.info("✅ Database initialized")

    # Seed admin user
    async with async_session() as db:
        from app.auth.service import seed_admin_user
        await seed_admin_user(db)
        logger.info(f"✅ Admin user '{settings.ADMIN_USERNAME}' ready")

    # Seed default templates
    async with async_session() as db:
        from app.templates.service import seed_default_templates
        await seed_default_templates(db)
        logger.info("✅ Default templates seeded")

    # Ensure Docker network exists
    try:
        from app.containers.service import ensure_network_exists
        await ensure_network_exists()
        logger.info(f"✅ Docker network '{settings.CONTAINER_NETWORK}' ready")
    except Exception as e:
        logger.warning(f"⚠️  Docker not available: {e}")
        logger.warning("   Container operations will fail until Docker is accessible")

    logger.info("🟢 LinuxLab is ready!")

    yield

    # ─── Shutdown ──────────────────────────────────────
    logger.info("🔴 Shutting down LinuxLab...")


# Create app
app = FastAPI(
    title="LinuxLab",
    description="Self-hosted disposable Linux environments for learning",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(containers_router)
app.include_router(templates_router)
app.include_router(logs_router)
app.include_router(sessions_router)
app.include_router(monitoring_router)
app.include_router(terminal_router)


@app.get("/api/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "linuxlab"}
