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
    # Always accept first, then authenticate — browser needs the 101 to read close reasons
    await websocket.accept()

    # Authenticate
    username = await authenticate_websocket(token)
    if not username:
        await websocket.send_text("Authentication required")
        await websocket.close(code=4001)
        return

    client = get_docker_client()
    exec_id = None
    raw_socket = None

    try:
        # Find the container by database ID
        from sqlalchemy import select
        from app.database import async_session
        from app.containers.models import Container

        async with async_session() as db:
            result = await db.execute(
                select(Container).where(Container.id == container_id)
            )
            container = result.scalar_one_or_none()

        if not container:
            await websocket.send_text("Container not found")
            await websocket.close(code=4004)
            return

        if container.status != "running":
            await websocket.send_text(f"Container is not running (status: {container.status})")
            await websocket.close(code=4002)
            return

        # Wait for the Docker container to be fully running (handles restarting state)
        def _wait_for_running(docker_id: str, timeout: int = 20) -> str:
            """Poll Docker until container is running or timeout. Returns final status."""
            import time
            deadline = time.time() + timeout
            while time.time() < deadline:
                try:
                    dc = client.containers.get(docker_id)
                    dc.reload()
                    if dc.status == "running":
                        return "running"
                    if dc.status in ("exited", "dead", "removing", "removed"):
                        return dc.status
                except Exception:
                    pass
                time.sleep(0.5)
            return "timeout"

        actual_status = await asyncio.to_thread(_wait_for_running, container.docker_id)
        if actual_status != "running":
            await websocket.send_text(
                f"Container could not be reached (status: {actual_status}). "
                "Try starting it again from the Containers page."
            )
            await websocket.close(code=4002)
            return

        # Create exec instance in the container (retry on 409 Conflict)
        def _create_exec():
            import time
            from docker.errors import APIError
            last_err = None
            for attempt in range(10):
                try:
                    dc = client.containers.get(container.docker_id)
                    exec_instance = client.api.exec_create(
                        dc.id,
                        cmd=["su", "-", container.username],
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
                    # Access the underlying socket
                    underlying = getattr(sock, "_sock", None) or getattr(sock, "raw", None) or sock
                    return exec_instance["Id"], sock, underlying
                except APIError as e:
                    if e.response is not None and e.response.status_code == 409:
                        last_err = e
                        time.sleep(1)
                        continue
                    raise
            raise last_err

        exec_id, sock_wrapper, raw_socket = await asyncio.to_thread(_create_exec)

        logger.info(f"Terminal session opened for container {container.name} by {username}")

        # Bidirectional bridge
        async def read_from_container():
            """Read output from Docker exec socket and send to WebSocket."""
            loop = asyncio.get_event_loop()
            try:
                while True:
                    data = await loop.run_in_executor(
                        None, lambda: raw_socket.recv(4096)
                    )
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

                    # Handle resize control messages
                    text = message.get("text", "")
                    if text.startswith("\x01"):
                        try:
                            control = json.loads(text[1:])
                            if control.get("type") == "resize":
                                cols = control.get("cols", 120)
                                rows = control.get("rows", 30)
                                await asyncio.to_thread(
                                    client.api.exec_resize, exec_id,
                                    height=rows, width=cols
                                )
                        except (json.JSONDecodeError, KeyError):
                            pass
                        continue

                    # Raw I/O — send bytes or text-as-bytes
                    data = message.get("bytes") or (text.encode() if text else None)
                    if data:
                        await loop.run_in_executor(None, lambda d=data: raw_socket.sendall(d))

            except WebSocketDisconnect:
                logger.debug("WebSocket disconnected")
            except Exception as e:
                logger.debug(f"Container write ended: {e}")

        # Run both tasks concurrently
        read_task = asyncio.create_task(read_from_container())
        write_task = asyncio.create_task(write_to_container())

        done, pending = await asyncio.wait(
            [read_task, write_task],
            return_when=asyncio.FIRST_COMPLETED,
        )

        for task in pending:
            task.cancel()
            try:
                await task
            except (asyncio.CancelledError, Exception):
                pass

    except WebSocketDisconnect:
        logger.info(f"Terminal session closed for container {container_id}")
    except Exception as e:
        logger.error(f"Terminal error for container {container_id}: {e}", exc_info=True)
        try:
            await websocket.send_text(f"Terminal error: {e}")
            await websocket.close(code=4000)
        except Exception:
            pass
    finally:
        if raw_socket:
            try:
                raw_socket.close()
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
    await websocket.accept()

    username = await authenticate_websocket(token)
    if not username:
        await websocket.close(code=4001)
        return

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
            await websocket.close(code=4004)
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
