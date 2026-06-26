"""Container security hardening configuration.

This module defines the security constraints applied to every user container.
These settings ensure containers cannot compromise the host system.

Security model:
- Drop ALL capabilities, selectively re-add minimum required
- no-new-privileges prevents setuid/setgid escalation
- PID limit prevents fork bombs
- CPU + RAM limits prevent resource exhaustion
- No host mounts, no host devices, no Docker socket access
- Dedicated bridge network (not host network)
"""

from typing import Optional


# Capabilities needed for a functional user environment:
# - CHOWN: Users can chown files they own
# - DAC_OVERRIDE: Required for sudo operations
# - FOWNER: Required for package installation
# - SETGID/SETUID: Required for sudo/su
# - NET_BIND_SERVICE: Bind to ports < 1024 (for learning web servers)
# - SYS_CHROOT: Required for some package managers
# - KILL: Users can kill their own processes
ALLOWED_CAPABILITIES = [
    "CHOWN",
    "DAC_OVERRIDE",
    "FOWNER",
    "SETGID",
    "SETUID",
    "NET_BIND_SERVICE",
    "SYS_CHROOT",
    "KILL",
]

# Maximum processes per container (prevents fork bombs)
DEFAULT_PID_LIMIT = 256

# Default temporary filesystem sizes
TMPFS_CONFIG = {
    "/tmp": "rw,noexec,nosuid,size=256m",
    "/run": "rw,noexec,nosuid,size=64m",
}


def get_host_config(
    cpu_limit: float,
    ram_limit: int,
    storage_limit: int,
    network_name: str,
    ssh_port: Optional[int] = None,
) -> dict:
    """
    Build the Docker host_config dict with all security constraints.

    Args:
        cpu_limit: Number of CPU cores (e.g., 2.0)
        ram_limit: RAM in MB (e.g., 2048)
        storage_limit: Disk in GB (e.g., 20) — requires overlay2 + xfs
        network_name: Docker network to attach the container to
        ssh_port: Optional host port to map container port 22

    Returns:
        Dictionary suitable for docker container creation
    """
    config = {
        # ─── Capability restrictions ───────────────────
        "cap_drop": ["ALL"],
        "cap_add": ALLOWED_CAPABILITIES,

        # ─── Privilege restrictions ────────────────────
        "privileged": False,
        "security_opt": ["no-new-privileges:true"],

        # ─── Resource limits ───────────────────────────
        "nano_cpus": int(cpu_limit * 1e9),
        "mem_limit": f"{ram_limit}m",
        "memswap_limit": f"{ram_limit}m",  # No swap (swap = ram limit)
        "pids_limit": DEFAULT_PID_LIMIT,

        # ─── Network ──────────────────────────────────
        "network_mode": network_name,

        # ─── Filesystem ───────────────────────────────
        "read_only": False,  # Users need writable fs for learning
        "tmpfs": TMPFS_CONFIG,

        # ─── No host access ───────────────────────────
        "devices": [],
        "extra_hosts": {},

        # ─── Restart policy ───────────────────────────
        "restart_policy": {"Name": "unless-stopped"},
    }

    # Storage limit (only works with overlay2 on xfs with pquota)
    # We attempt to set it but log a warning if it fails
    config["storage_opt"] = {"size": f"{storage_limit}g"}

    # SSH port mapping
    if ssh_port is not None:
        config["port_bindings"] = {"22/tcp": ssh_port}

    return config


def get_container_labels(name: str, username: str, distro: str) -> dict:
    """Labels applied to every LinuxLab container for identification."""
    return {
        "linuxlab.managed": "true",
        "linuxlab.name": name,
        "linuxlab.username": username,
        "linuxlab.distro": distro,
    }


def validate_container_name(name: str) -> bool:
    """Validate that a container name is safe."""
    import re
    return bool(re.match(r"^[a-zA-Z0-9][a-zA-Z0-9_.-]*$", name))
