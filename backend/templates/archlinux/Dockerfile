FROM archlinux:latest

RUN pacman -Syu --noconfirm && pacman -S --noconfirm \
    sudo bash-completion \
    curl wget git \
    vim nano less \
    python python-pip \
    gcc make \
    tmux htop tree \
    net-tools iputils iproute2 bind \
    openssh \
    man-db man-pages \
    zip unzip tar gzip \
    ca-certificates gnupg \
    && pacman -Scc --noconfirm

RUN ssh-keygen -A && \
    sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config

RUN echo '#!/bin/bash\n\
set -e\n\
USERNAME="${LABUSER:-labuser}"\n\
PASSWORD="${LABPASS:-changeme}"\n\
if ! id "$USERNAME" &>/dev/null; then\n\
    useradd -m -s /bin/bash "$USERNAME"\n\
    echo "$USERNAME:$PASSWORD" | chpasswd\n\
    echo "$USERNAME ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers\n\
fi\n\
/usr/sbin/sshd 2>/dev/null || true\n\
exec sleep infinity\n' > /entrypoint.sh && chmod +x /entrypoint.sh

EXPOSE 22
CMD ["/entrypoint.sh"]
