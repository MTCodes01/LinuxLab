"""Container management service using Docker SDK.

Handles all Docker operations: create, start, stop, restart, reset, delete.
All operations go through the security module for hardening.
"""

import asyncio
import logging
from datetime import datetime
from typing import Optional

import docker
from docker.errors import NotFound, APIError, ImageNotFound
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.containers.models import Container
from app.containers.security import get_host_config, get_container_labels
from app.auth.service import get_password_hash

logger = logging.getLogger(__name__)

# Docker client (singleton)
_docker_client: Optional[docker.DockerClient] = None


# ─── Template image mapping ────────────────────────────────
DISTRO_IMAGES = {
    "ubuntu-24.04": {"image": "linuxlab/ubuntu:24.04", "dockerfile": "templates/ubuntu-24.04"},
    "debian-12": {"image": "linuxlab/debian:12", "dockerfile": "templates/debian-12"},
    "fedora": {"image": "linuxlab/fedora:latest", "dockerfile": "templates/fedora"},
    "alpine": {"image": "linuxlab/alpine:latest", "dockerfile": "templates/alpine"},
    "archlinux": {"image": "linuxlab/archlinux:latest", "dockerfile": "templates/archlinux"},
    "python-lab": {"image": "linuxlab/python-lab:latest", "dockerfile": "templates/python-lab"},
    "c-dev-lab": {"image": "linuxlab/c-dev-lab:latest", "dockerfile": "templates/c-dev-lab"},
    "docker-learning-lab": {"image": "linuxlab/docker-learning:latest", "dockerfile": "templates/docker-learning-lab"},
}


def get_docker_client() -> docker.DockerClient:
    """Get or create the Docker client singleton."""
    global _docker_client
    if _docker_client is None:
        _docker_client = docker.DockerClient(base_url=f"unix://{settings.DOCKER_SOCKET_PATH}")
    return _docker_client


async def ensure_network_exists() -> None:
    """Create the container network if it doesn't exist."""
    client = get_docker_client()

    def _ensure():
        try:
            client.networks.get(settings.CONTAINER_NETWORK)
        except NotFound:
            client.networks.create(
                settings.CONTAINER_NETWORK,
                driver="bridge",
                internal=False,
                labels={"linuxlab.managed": "true"},
            )
            logger.info(f"Created Docker network: {settings.CONTAINER_NETWORK}")

    await asyncio.to_thread(_ensure)


async def build_image_if_needed(distro: str) -> str:
    """Build the container image if not already present. Returns image name."""
    if distro not in DISTRO_IMAGES:
        raise ValueError(f"Unknown distro: {distro}. Available: {list(DISTRO_IMAGES.keys())}")

    image_info = DISTRO_IMAGES[distro]
    image_name = image_info["image"]
    client = get_docker_client()

    def _build():
        try:
            client.images.get(image_name)
            logger.info(f"Image {image_name} already exists")
        except ImageNotFound:
            logger.info(f"Building image {image_name} from {image_info['dockerfile']}...")
            client.images.build(
                path=image_info["dockerfile"],
                tag=image_name,
                rm=True,
                forcerm=True,
            )
            logger.info(f"Built image {image_name}")
        return image_name

    return await asyncio.to_thread(_build)


async def create_container(
    db: AsyncSession,
    name: str,
    username: str,
    password: str,
    distro: str,
    cpu_limit: float = 1.0,
    ram_limit: int = 512,
    storage_limit: int = 10,
    ssh_enabled: bool = False,
    lifetime_hours: Optional[int] = None,
    template_id: Optional[int] = None,
) -> Container:
    """Create a new container with full security hardening."""
    client = get_docker_client()
    container_name = f"{settings.CONTAINER_PREFIX}{name}"
    image_name = await build_image_if_needed(distro)

    # Find available SSH port
    ssh_port = None
    if ssh_enabled:
        ssh_port = await _find_available_ssh_port(db)

    # Build security-hardened host config
    host_config = get_host_config(
        cpu_limit=cpu_limit,
        ram_limit=ram_limit,
        storage_limit=storage_limit,
        network_name=settings.CONTAINER_NETWORK,
        ssh_port=ssh_port,
    )

    labels = get_container_labels(name, username, distro)

    def _create():
        try:
            # Create the container
            container = client.containers.create(
                image=image_name,
                name=container_name,
                hostname=name,
                environment={
                    "LABUSER": username,
                    "LABPASS": password,
                    "TERM": "xterm-256color",
                },
                labels=labels,
                stdin_open=True,
                tty=True,
                detach=True,
                ports={"22/tcp": ssh_port} if ssh_enabled else {},
                cap_drop=host_config.pop("cap_drop"),
                cap_add=host_config.pop("cap_add"),
                security_opt=host_config.pop("security_opt"),
                mem_limit=host_config.pop("mem_limit"),
                memswap_limit=host_config.pop("memswap_limit"),
                nano_cpus=host_config.pop("nano_cpus"),
                pids_limit=host_config.pop("pids_limit"),
                network=host_config.pop("network_mode"),
                read_only=host_config.pop("read_only"),
                privileged=host_config.pop("privileged"),
                restart_policy=host_config.pop("restart_policy"),
                tmpfs=host_config.pop("tmpfs"),
            )

            # Start the container
            container.start()

            # Get container info
            container.reload()
            return container
        except APIError as e:
            logger.error(f"Docker API error creating container {name}: {e}")
            raise

    docker_container = await asyncio.to_thread(_create)

    # Get IP address
    ip_address = _get_container_ip(docker_container)

    # Save to database
    db_container = Container(
        name=name,
        docker_id=docker_container.id,
        username=username,
        hashed_password=get_password_hash(password),
        password_plain=password,
        distro=distro,
        image_name=image_name,
        status="running",
        cpu_limit=cpu_limit,
        ram_limit=ram_limit,
        storage_limit=storage_limit,
        ip_address=ip_address,
        ssh_enabled=ssh_enabled,
        ssh_port=ssh_port,
        lifetime_hours=lifetime_hours,
        template_id=template_id,
    )
    db.add(db_container)
    await db.commit()
    await db.refresh(db_container)

    logger.info(f"Created container {name} (ID: {docker_container.short_id})")
    return db_container


async def start_container(db: AsyncSession, container_id: int) -> Container:
    """Start a stopped container."""
    container = await _get_container_or_404(db, container_id)
    client = get_docker_client()

    def _start():
        try:
            dc = client.containers.get(container.docker_id)
            dc.start()
            dc.reload()
            return dc
        except NotFound:
            raise ValueError(f"Docker container {container.docker_id} not found")

    dc = await asyncio.to_thread(_start)
    container.status = "running"
    container.ip_address = _get_container_ip(dc)
    container.last_active = datetime.utcnow()
    await db.commit()
    await db.refresh(container)
    return container


async def stop_container(db: AsyncSession, container_id: int) -> Container:
    """Stop a running container."""
    container = await _get_container_or_404(db, container_id)
    client = get_docker_client()

    def _stop():
        try:
            dc = client.containers.get(container.docker_id)
            dc.stop(timeout=10)
        except NotFound:
            logger.warning(f"Docker container {container.docker_id} already gone")

    await asyncio.to_thread(_stop)
    container.status = "stopped"
    container.last_active = datetime.utcnow()
    await db.commit()
    await db.refresh(container)
    return container


async def restart_container(db: AsyncSession, container_id: int) -> Container:
    """Restart a container."""
    container = await _get_container_or_404(db, container_id)
    client = get_docker_client()

    def _restart():
        try:
            dc = client.containers.get(container.docker_id)
            dc.restart(timeout=10)
            dc.reload()
            return dc
        except NotFound:
            raise ValueError(f"Docker container {container.docker_id} not found")

    dc = await asyncio.to_thread(_restart)
    container.status = "running"
    container.ip_address = _get_container_ip(dc)
    container.last_active = datetime.utcnow()
    await db.commit()
    await db.refresh(container)
    return container


async def reset_container(db: AsyncSession, container_id: int) -> Container:
    """Reset a container to fresh state: destroy and recreate with same config."""
    container = await _get_container_or_404(db, container_id)
    client = get_docker_client()

    # Remove existing Docker container
    def _remove():
        try:
            dc = client.containers.get(container.docker_id)
            dc.stop(timeout=5)
            dc.remove(force=True)
        except NotFound:
            logger.warning(f"Container {container.docker_id} already gone during reset")

    await asyncio.to_thread(_remove)

    # Recreate with same configuration
    host_config = get_host_config(
        cpu_limit=container.cpu_limit,
        ram_limit=container.ram_limit,
        storage_limit=container.storage_limit,
        network_name=settings.CONTAINER_NETWORK,
        ssh_port=container.ssh_port if container.ssh_enabled else None,
    )

    container_name = f"{settings.CONTAINER_PREFIX}{container.name}"
    labels = get_container_labels(container.name, container.username, container.distro)

    def _recreate():
        dc = client.containers.create(
            image=container.image_name,
            name=container_name,
            hostname=container.name,
            environment={
                "LABUSER": container.username,
                "LABPASS": container.password_plain,
                "TERM": "xterm-256color",
            },
            labels=labels,
            stdin_open=True,
            tty=True,
            detach=True,
            ports={"22/tcp": container.ssh_port} if container.ssh_enabled else {},
            cap_drop=host_config.pop("cap_drop"),
            cap_add=host_config.pop("cap_add"),
            security_opt=host_config.pop("security_opt"),
            mem_limit=host_config.pop("mem_limit"),
            memswap_limit=host_config.pop("memswap_limit"),
            nano_cpus=host_config.pop("nano_cpus"),
            pids_limit=host_config.pop("pids_limit"),
            network=host_config.pop("network_mode"),
            read_only=host_config.pop("read_only"),
            privileged=host_config.pop("privileged"),
            restart_policy=host_config.pop("restart_policy"),
            tmpfs=host_config.pop("tmpfs"),
        )
        dc.start()
        dc.reload()
        return dc

    dc = await asyncio.to_thread(_recreate)

    container.docker_id = dc.id
    container.status = "running"
    container.ip_address = _get_container_ip(dc)
    container.last_active = datetime.utcnow()
    await db.commit()
    await db.refresh(container)

    logger.info(f"Reset container {container.name} (new ID: {dc.short_id})")
    return container


async def delete_container(db: AsyncSession, container_id: int) -> None:
    """Delete a container permanently."""
    container = await _get_container_or_404(db, container_id)
    client = get_docker_client()

    def _delete():
        try:
            dc = client.containers.get(container.docker_id)
            dc.stop(timeout=5)
            dc.remove(force=True, v=True)
        except NotFound:
            logger.warning(f"Container {container.docker_id} already gone during delete")

    await asyncio.to_thread(_delete)

    await db.delete(container)
    await db.commit()
    logger.info(f"Deleted container {container.name}")


async def get_container_stats(container_id: int, db: AsyncSession) -> dict:
    """Get real-time stats for a container."""
    container = await _get_container_or_404(db, container_id)
    client = get_docker_client()

    def _stats():
        try:
            dc = client.containers.get(container.docker_id)
            stats = dc.stats(stream=False)
            return _parse_stats(stats, container)
        except NotFound:
            return _empty_stats(container)

    return await asyncio.to_thread(_stats)


async def list_containers(db: AsyncSession) -> list[Container]:
    """List all managed containers."""
    result = await db.execute(select(Container).order_by(Container.created_at.desc()))
    return list(result.scalars().all())


async def get_container(db: AsyncSession, container_id: int) -> Container:
    """Get a single container by ID."""
    return await _get_container_or_404(db, container_id)


async def sync_container_status(db: AsyncSession, container_id: int) -> Container:
    """Sync the database status with the actual Docker container state."""
    container = await _get_container_or_404(db, container_id)
    client = get_docker_client()

    def _sync():
        try:
            dc = client.containers.get(container.docker_id)
            return dc.status
        except NotFound:
            return "removed"

    status = await asyncio.to_thread(_sync)

    status_map = {
        "running": "running",
        "exited": "stopped",
        "paused": "paused",
        "restarting": "restarting",
        "created": "stopped",
        "dead": "stopped",
        "removing": "stopped",
        "removed": "stopped",
    }
    container.status = status_map.get(status, "unknown")
    await db.commit()
    await db.refresh(container)
    return container


# ─── Private helpers ────────────────────────────────────


async def _get_container_or_404(db: AsyncSession, container_id: int) -> Container:
    """Get a container by ID or raise an error."""
    result = await db.execute(
        select(Container).where(Container.id == container_id)
    )
    container = result.scalar_one_or_none()
    if container is None:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Container with ID {container_id} not found",
        )
    return container


async def _find_available_ssh_port(db: AsyncSession) -> int:
    """Find an available SSH port in the configured range."""
    result = await db.execute(
        select(Container.ssh_port).where(Container.ssh_port.isnot(None))
    )
    used_ports = {row[0] for row in result.all()}

    for port in range(settings.SSH_PORT_RANGE_START, settings.SSH_PORT_RANGE_END + 1):
        if port not in used_ports:
            return port

    raise ValueError("No available SSH ports in range")


def _get_container_ip(docker_container) -> Optional[str]:
    """Extract IP address from Docker container inspect data."""
    try:
        networks = docker_container.attrs.get("NetworkSettings", {}).get("Networks", {})
        for net_name, net_info in networks.items():
            ip = net_info.get("IPAddress")
            if ip:
                return ip
    except Exception:
        pass
    return None


def _parse_stats(stats: dict, container: Container) -> dict:
    """Parse Docker stats into a clean response."""
    # CPU calculation
    cpu_delta = stats["cpu_stats"]["cpu_usage"]["total_usage"] - \
                stats.get("precpu_stats", {}).get("cpu_usage", {}).get("total_usage", 0)
    system_delta = stats["cpu_stats"].get("system_cpu_usage", 0) - \
                   stats.get("precpu_stats", {}).get("system_cpu_usage", 0)
    num_cpus = stats["cpu_stats"].get("online_cpus", 1)
    cpu_percent = (cpu_delta / system_delta * num_cpus * 100.0) if system_delta > 0 else 0.0

    # Memory
    mem_usage = stats["memory_stats"].get("usage", 0)
    mem_limit = stats["memory_stats"].get("limit", 0)
    mem_used_mb = mem_usage / (1024 * 1024)
    mem_limit_mb = container.ram_limit
    mem_percent = (mem_usage / mem_limit * 100.0) if mem_limit > 0 else 0.0

    # Network
    networks = stats.get("networks", {})
    rx_bytes = sum(n.get("rx_bytes", 0) for n in networks.values())
    tx_bytes = sum(n.get("tx_bytes", 0) for n in networks.values())

    # PIDs
    pids = stats.get("pids_stats", {}).get("current", 0)

    return {
        "container_id": container.id,
        "cpu_percent": round(cpu_percent, 2),
        "ram_used_mb": round(mem_used_mb, 2),
        "ram_limit_mb": mem_limit_mb,
        "ram_percent": round(mem_percent, 2),
        "disk_used_mb": 0,  # Requires exec into container
        "disk_limit_mb": container.storage_limit * 1024,
        "disk_percent": 0,
        "network_rx_bytes": rx_bytes,
        "network_tx_bytes": tx_bytes,
        "pids": pids,
        "uptime_seconds": 0,  # Calculated from container start time
    }


def _empty_stats(container: Container) -> dict:
    """Return empty stats for a non-running container."""
    return {
        "container_id": container.id,
        "cpu_percent": 0,
        "ram_used_mb": 0,
        "ram_limit_mb": container.ram_limit,
        "ram_percent": 0,
        "disk_used_mb": 0,
        "disk_limit_mb": container.storage_limit * 1024,
        "disk_percent": 0,
        "network_rx_bytes": 0,
        "network_tx_bytes": 0,
        "pids": 0,
        "uptime_seconds": 0,
    }
