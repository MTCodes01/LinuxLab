#!/bin/bash
set -e

USERNAME="${LABUSER:-labuser}"
PASSWORD="${LABPASS:-changeme}"

if ! id "$USERNAME" &>/dev/null; then
    useradd -m -s /bin/bash "$USERNAME"
    echo "$USERNAME:$PASSWORD" | chpasswd
    echo "$USERNAME ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers
fi

mkdir -p /run/sshd
/usr/sbin/sshd 2>/dev/null || true

exec sleep infinity
