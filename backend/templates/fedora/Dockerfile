FROM fedora:latest

RUN dnf install -y \
    sudo bash-completion \
    curl wget git \
    vim-enhanced nano less \
    python3 python3-pip \
    gcc gcc-c++ make \
    tmux htop tree \
    net-tools iputils iproute bind-utils \
    openssh-server \
    man-db man-pages \
    zip unzip tar gzip \
    ca-certificates gnupg2 \
    langpacks-en \
    && dnf clean all

ENV LANG=en_US.UTF-8

RUN ssh-keygen -A && \
    sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config

COPY entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh

EXPOSE 22
CMD ["/entrypoint.sh"]
