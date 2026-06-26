FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    sudo bash-completion \
    curl wget git \
    vim nano less \
    python3 python3-pip python3-venv python3-dev \
    python3-numpy python3-pandas \
    tmux htop tree \
    net-tools iputils-ping iproute2 \
    openssh-server \
    man-db zip unzip tar \
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
    # Create Python virtual environment\n\
    su - "$USERNAME" -c "python3 -m venv /home/$USERNAME/venv"\n\
    echo "source ~/venv/bin/activate" >> /home/$USERNAME/.bashrc\n\
    su - "$USERNAME" -c "/home/$USERNAME/venv/bin/pip install ipython requests flask django"\n\
fi\n\
/usr/sbin/sshd 2>/dev/null || true\n\
exec sleep infinity\n' > /entrypoint.sh && chmod +x /entrypoint.sh

EXPOSE 22
CMD ["/entrypoint.sh"]
