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

COPY entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh

EXPOSE 22
CMD ["/entrypoint.sh"]
