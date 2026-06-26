#!/bin/bash
set -e

USERNAME="${LABUSER:-labuser}"
PASSWORD="${LABPASS:-changeme}"
if ! id "$USERNAME" &>/dev/null; then
    useradd -m -s /bin/bash "$USERNAME"
    echo "$USERNAME:$PASSWORD" | chpasswd
    echo "$USERNAME ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers
    # Create Python virtual environment
    su - "$USERNAME" -c "python3 -m venv /home/$USERNAME/venv"
    echo "source ~/venv/bin/activate" >> /home/$USERNAME/.bashrc
    su - "$USERNAME" -c "/home/$USERNAME/venv/bin/pip install ipython requests flask django"
fi

mkdir -p /run/sshd
/usr/sbin/sshd 2>/dev/null || true

exec sleep infinity
