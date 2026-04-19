FROM node:24-slim AS build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app/client
COPY ./client/package.json ./client/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY ./client .
ENV VITE_API_URL=http://localhost/api
RUN pnpm build

FROM caddy:2.11-alpine
COPY --from=build /app/client/dist /srv