FROM alpine:latest

RUN apk add --no-cache \
    sudo bash bash-completion shadow \
    curl wget git \
    vim nano less \
    python3 py3-pip \
    gcc g++ musl-dev make \
    tmux htop tree \
    net-tools iputils iproute2 bind-tools \
    openssh-server \
    man-db man-pages mandoc \
    zip unzip tar gzip \
    ca-certificates gnupg

RUN ssh-keygen -A && \
    sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config

RUN echo '#!/bin/bash\n\
set -e\n\
USERNAME="${LABUSER:-labuser}"\n\
PASSWORD="${LABPASS:-changeme}"\n\
if ! id "$USERNAME" &>/dev/null; then\n\
    adduser -D -s /bin/bash "$USERNAME"\n\
    echo "$USERNAME:$PASSWORD" | chpasswd\n\
    echo "$USERNAME ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers\n\
fi\n\
/usr/sbin/sshd 2>/dev/null || true\n\
exec sleep infinity\n' > /entrypoint.sh && chmod +x /entrypoint.sh

EXPOSE 22
CMD ["/entrypoint.sh"]
