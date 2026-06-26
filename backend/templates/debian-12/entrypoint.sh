#!/bin/bash
set -e

USERNAME="${LABUSER:-labuser}"
PASSWORD="${LABPASS:-changeme}"

# Create user if not exists
if ! id "$USERNAME" &>/dev/null; then
    useradd -m -s /bin/bash "$USERNAME"
    echo "$USERNAME:$PASSWORD" | chpasswd
    echo "$USERNAME ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers
fi

# Create /run/sshd at runtime — /run is mounted as tmpfs so it's empty on start
mkdir -p /run/sshd

# Start SSH daemon
/usr/sbin/sshd 2>/dev/null || true

# Keep container alive
exec sleep infinity
