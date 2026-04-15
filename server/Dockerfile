FROM node:24-slim AS build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

RUN dpkg --add-architecture i386 \
    mkdir -p /etc/apt/keyrings \
    wget -O - https://dl.winehq.org/wine-builds/winehq.key | sudo gpg --dearmor -o /etc/apt/keyrings/winehq-archive.key \
    wget -NP /etc/apt/sources.list.d/ https://dl.winehq.org/wine-builds/ubuntu/dists/noble/winehq-noble.sources \
    apt-get update \ 
    apt-get install -y \
    sudo apt install --install-recommends winehq-devel \
    wineboot --init \
    python3 \
    pip install binary-reader flatbuffers numpy \
    && rm -rf /var/lib/apt/lists/*
CMD ["pnpm", "start"]