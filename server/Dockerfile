FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm build

FROM base AS prod-deps
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store pnpm install --frozen-lockfile --prod

FROM node:24-slim AS runtime
ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /app

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/libs ./src/libs

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
        blender \
    && python3 -m pip install --no-cache-dir -r src/libs/supercell-flat-converter/requirements.txt --break-system-packages \
    && wineboot --init \
    && rm -rf /var/lib/apt/lists/*

CMD ["node", "dist/index.js"]