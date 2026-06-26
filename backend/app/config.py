"""Application configuration using Pydantic BaseSettings."""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """LinuxLab application settings loaded from environment variables."""

    # ─── Security ──────────────────────────────────────
    SECRET_KEY: str = "change-me-to-a-random-64-char-string"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # ─── Admin ─────────────────────────────────────────
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "changeme"

    # ─── Database ──────────────────────────────────────
    DATABASE_URL: str = "sqlite+aiosqlite:///./data/linuxlab.db"

    # ─── Docker ────────────────────────────────────────
    DOCKER_SOCKET_PATH: str = "/var/run/docker.sock"
    CONTAINER_NETWORK: str = "linuxlab-containers"
    CONTAINER_PREFIX: str = "linuxlab-"

    # ─── Server ────────────────────────────────────────
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:80"
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000

    # ─── Features ──────────────────────────────────────
    DEFAULT_CONTAINER_LIFETIME_HOURS: int = 0  # 0 = no auto-delete
    MAX_CONTAINERS: int = 50
    ENABLE_SSH: bool = True
    SSH_PORT_RANGE_START: int = 2200
    SSH_PORT_RANGE_END: int = 2299

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }


settings = Settings()
