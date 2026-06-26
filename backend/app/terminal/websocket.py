"""WebSocket ↔ Docker exec bridge for browser-based terminal access.

This is the latency-critical path: every keystroke goes through this bridge.
Uses raw Docker API sockets for minimal overhead.
"""

import asyncio
import json
import logging
from typing import Optional

import docker
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from jose import JWTError, jwt

from app.config import settings
from app.containers.service import get_docker_client

logger = logging.getLogger(__name__)
router = APIRouter()


async def authenticate_websocket(token: Optional[str]) -> Optional[str]:
    """Validate JWT token from WebSocket query parameter. Returns username or None."""
    if not token:
        return None
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None


@router.websocket("/ws/terminal/{container_id}")
async def terminal_websocket(
    websocket: WebSocket,
    container_id: int,
    token: Optional[str] = Query(None),
):
    """
    WebSocket endpoint for interactive terminal access.

    Protocol:
    - Binary frames: terminal I/O data (stdin/stdout)
    - Text frames starting with '\\x01': JSON control messages (e.g., resize)
    - All other text frames: terminal input
    """
    # Authenticate
    username = await authenticate_websocket(token)
    if not username:
        await websocket.close(code=4001, reason="Authentication required")
        return

    await websocket.accept()

    client = get_docker_client()
    exec_id = None
    socket = None

    try:
        # Find the container by database ID
        # We look up containers by label since we need the Docker container object
        from sqlalchemy import select
        from app.database import async_session
        from app.containers.models import Container

        async with async_session() as db:
            result = await db.execute(
                select(Container).where(Container.id == container_id)
            )
            container = result.scalar_one_or_none()

        if not container:
            await websocket.send_text(json.dumps({"error": "Container not found"}))
            await websocket.close(code=4004, reason="Container not found")
            return

        if container.status != "running":
            await websocket.send_text(json.dumps({"error": "Container is not running"}))
            await websocket.close(code=4002, reason="Container not running")
            return

        # Create exec instance in the container
        def _create_exec():
            dc = client.containers.get(container.docker_id)
            exec_instance = client.api.exec_create(
                dc.id,
                cmd=f"/bin/bash -c 'su - {container.username}'",
                stdin=True,
                stdout=True,
                stderr=True,
                tty=True,
                environment={"TERM": "xterm-256color", "COLUMNS": "120", "LINES": "30"},
            )
            sock = client.api.exec_start(
                exec_instance["Id"],
                socket=True,
                tty=True,
            )
            return exec_instance["Id"], sock

        exec_id, socket = await asyncio.to_thread(_create_exec)

        # Get the raw socket for reading
        raw_socket = socket._sock

        logger.info(f"Terminal session opened for container {container.name} by {username}")

        # Bidirectional bridge
        async def read_from_container():
            """Read output from Docker exec socket and send to WebSocket."""
            loop = asyncio.get_event_loop()
            try:
                while True:
                    data = await loop.run_in_executor(None, lambda: raw_socket.recv(4096))
                    if not data:
                        break
                    await websocket.send_bytes(data)
            except Exception as e:
                logger.debug(f"Container read ended: {e}")

        async def write_to_container():
            """Read input from WebSocket and send to Docker exec socket."""
            loop = asyncio.get_event_loop()
            try:
                while True:
                    message = await websocket.receive()

                    if message.get("type") == "websocket.disconnect":
                        break

                    data = message.get("bytes") or (message.get("text", "").encode())

                    if not data:
                        continue

                    # Check for control messages (resize)
                    if message.get("text", "").startswith("\x01"):
                        try:
                            control = json.loads(message["text"][1:])
                            if control.get("type") == "resize":
                                cols = control.get("cols", 120)
                                rows = control.get("rows", 30)
                                await asyncio.to_thread(
                                    client.api.exec_resize, exec_id,
                                    height=rows, width=cols
                                )
                            continue
                        except (json.JSONDecodeError, KeyError):
                            pass

                    await loop.run_in_executor(None, lambda d=data: raw_socket.sendall(d))
            except WebSocketDisconnect:
                logger.debug("WebSocket disconnected")
            except Exception as e:
                logger.debug(f"Container write ended: {e}")

        # Run both tasks concurrently
        read_task = asyncio.create_task(read_from_container())
        write_task = asyncio.create_task(write_to_container())

        # Wait for either to finish (usually means disconnect)
        done, pending = await asyncio.wait(
            [read_task, write_task],
            return_when=asyncio.FIRST_COMPLETED,
        )

        # Cancel the other task
        for task in pending:
            task.cancel()
            try:
                await task
            except (asyncio.CancelledError, Exception):
                pass

    except WebSocketDisconnect:
        logger.info(f"Terminal session closed for container {container_id}")
    except Exception as e:
        logger.error(f"Terminal error for container {container_id}: {e}")
        try:
            await websocket.close(code=4000, reason="Internal error")
        except Exception:
            pass
    finally:
        if socket:
            try:
                socket.close()
            except Exception:
                pass
        logger.info(f"Terminal cleanup complete for container {container_id}")


@router.websocket("/ws/monitoring/{container_id}")
async def monitoring_websocket(
    websocket: WebSocket,
    container_id: int,
    token: Optional[str] = Query(None),
):
    """WebSocket endpoint for live resource monitoring (1-second updates)."""
    username = await authenticate_websocket(token)
    if not username:
        await websocket.close(code=4001, reason="Authentication required")
        return

    await websocket.accept()

    client = get_docker_client()

    try:
        from sqlalchemy import select
        from app.database import async_session
        from app.containers.models import Container

        async with async_session() as db:
            result = await db.execute(
                select(Container).where(Container.id == container_id)
            )
            container = result.scalar_one_or_none()

        if not container:
            await websocket.close(code=4004, reason="Container not found")
            return

        def _get_stats():
            try:
                dc = client.containers.get(container.docker_id)
                return dc.stats(stream=False)
            except Exception:
                return None

        while True:
            stats = await asyncio.to_thread(_get_stats)
            if stats:
                # Parse stats
                from app.containers.service import _parse_stats
                parsed = _parse_stats(stats, container)
                await websocket.send_text(json.dumps(parsed))
            else:
                await websocket.send_text(json.dumps({"error": "Container not available"}))

            await asyncio.sleep(1)

    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error(f"Monitoring error for container {container_id}: {e}")
