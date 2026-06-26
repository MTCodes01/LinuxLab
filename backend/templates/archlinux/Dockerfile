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

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 22
CMD ["/entrypoint.sh"]
