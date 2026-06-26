FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    sudo bash-completion \
    curl wget git \
    vim nano less \
    gcc g++ make cmake \
    gdb valgrind strace ltrace \
    python3 \
    tmux htop tree \
    net-tools iputils-ping iproute2 \
    openssh-server \
    man-db manpages manpages-dev \
    zip unzip tar \
    ca-certificates locales \
    && rm -rf /var/lib/apt/lists/*

RUN locale-gen en_US.UTF-8
ENV LANG=en_US.UTF-8 LANGUAGE=en_US:en LC_ALL=en_US.UTF-8

RUN mkdir -p /var/run/sshd

RUN echo '#!/bin/bash\n\
set -e\n\
USERNAME="${LABUSER:-labuser}"\n\
PASSWORD="${LABPASS:-changeme}"\n\
if ! id "$USERNAME" &>/dev/null; then\n\
    useradd -m -s /bin/bash "$USERNAME"\n\
    echo "$USERNAME:$PASSWORD" | chpasswd\n\
    echo "$USERNAME ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers\n\
    # Create sample C project\n\
    mkdir -p /home/$USERNAME/projects/hello\n\
    echo "#include <stdio.h>\\nint main() {\\n    printf(\"Hello from LinuxLab!\\\\n\");\\n    return 0;\\n}" > /home/$USERNAME/projects/hello/main.c\n\
    echo "CC=gcc\\nCFLAGS=-Wall -Wextra -g\\n\\nhello: main.c\\n\\t\\$(CC) \\$(CFLAGS) -o hello main.c\\n\\nclean:\\n\\trm -f hello" > /home/$USERNAME/projects/hello/Makefile\n\
    chown -R $USERNAME:$USERNAME /home/$USERNAME/projects\n\
fi\n\
/usr/sbin/sshd 2>/dev/null || true\n\
exec sleep infinity\n' > /entrypoint.sh && chmod +x /entrypoint.sh

EXPOSE 22
CMD ["/entrypoint.sh"]
