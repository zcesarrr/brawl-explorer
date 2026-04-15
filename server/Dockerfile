FROM node:24-slim AS build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV DEBIAN_FRONTEND=noninteractive
RUN corepack enable

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

RUN dpkg --add-architecture i386 \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        gpg \
        python3 \
        python3-pip \
        wget \
        wine \
        wine32 \
        wine64 \
    && python3 -m pip install --no-cache-dir -r src/libs/supercell-flat-converter/requirements.txt --break-system-packages \
    && wineboot --init \
    && rm -rf /var/lib/apt/lists/*
CMD ["pnpm", "start"]