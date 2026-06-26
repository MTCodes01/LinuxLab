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

RUN locale-gen en_US.UTF-8 && update-locale LANG=en_US.UTF-8
ENV LANG=en_US.UTF-8 LANGUAGE=en_US:en LC_ALL=en_US.UTF-8

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 22
CMD ["/entrypoint.sh"]
