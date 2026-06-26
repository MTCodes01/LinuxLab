#!/bin/bash
set -e

USERNAME="${LABUSER:-labuser}"
PASSWORD="${LABPASS:-changeme}"
if ! id "$USERNAME" &>/dev/null; then
    useradd -m -s /bin/bash "$USERNAME"
    echo "$USERNAME:$PASSWORD" | chpasswd
    echo "$USERNAME ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers
    # Create sample C project
    mkdir -p /home/$USERNAME/projects/hello
    echo -e "#include <stdio.h>\nint main() {\n    printf(\"Hello from LinuxLab!\\n\");\n    return 0;\n}" > /home/$USERNAME/projects/hello/main.c
    echo -e "CC=gcc\nCFLAGS=-Wall -Wextra -g\n\nhello: main.c\n\t\$(CC) \$(CFLAGS) -o hello main.c\n\nclean:\n\trm -f hello" > /home/$USERNAME/projects/hello/Makefile
    chown -R $USERNAME:$USERNAME /home/$USERNAME/projects
fi

mkdir -p /run/sshd
/usr/sbin/sshd 2>/dev/null || true

exec sleep infinity
