FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

# Install essential tools for Linux learning
RUN apt-get update && apt-get install -y --no-install-recommends \
    sudo bash-completion \
    curl wget git \
    vim nano less \
    python3 python3-pip python3-venv \
    gcc g++ make \
    tmux htop tree neofetch \
    net-tools iputils-ping iproute2 dnsutils \
    openssh-server \
    man-db manpages manpages-dev \
    zip unzip tar gzip \
    ca-certificates gnupg \
    locales \
    && rm -rf /var/lib/apt/lists/*

# Set locale
RUN locale-gen en_US.UTF-8
ENV LANG=en_US.UTF-8 LANGUAGE=en_US:en LC_ALL=en_US.UTF-8

# SSH setup
RUN mkdir -p /var/run/sshd && \
    sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config && \
    sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config

# Entrypoint script: creates user from env vars
RUN echo '#!/bin/bash\n\
set -e\n\
USERNAME="${LABUSER:-labuser}"\n\
PASSWORD="${LABPASS:-changeme}"\n\
\n\
# Create user if not exists\n\
if ! id "$USERNAME" &>/dev/null; then\n\
    useradd -m -s /bin/bash "$USERNAME"\n\
    echo "$USERNAME:$PASSWORD" | chpasswd\n\
    echo "$USERNAME ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers\n\
fi\n\
\n\
# Start SSH if configured\n\
if [ -f /etc/ssh/sshd_config ]; then\n\
    /usr/sbin/sshd\n\
fi\n\
\n\
# Keep container running\n\
exec sleep infinity\n' > /entrypoint.sh && chmod +x /entrypoint.sh

EXPOSE 22
CMD ["/entrypoint.sh"]
