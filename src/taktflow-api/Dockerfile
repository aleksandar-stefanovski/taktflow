# syntax=docker/dockerfile:1

# ── base ─────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS base
# argon2 requires native compilation
RUN apk add --no-cache python3 make g++ && npm install -g pnpm
WORKDIR /app

# ── deps ─────────────────────────────────────────────────────────────────────
FROM base AS deps
# Copy workspace manifests only — enables layer caching on source changes
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY src/taktflow-abstractions/package.json   ./src/taktflow-abstractions/
COPY src/taktflow-api/package.json            ./src/taktflow-api/
COPY src/taktflow-application/package.json    ./src/taktflow-application/
COPY src/taktflow-domain/package.json         ./src/taktflow-domain/
COPY src/taktflow-infrastructure/package.json ./src/taktflow-infrastructure/
COPY src/taktflow-persistence/package.json    ./src/taktflow-persistence/
COPY src/taktflow-worker/package.json         ./src/taktflow-worker/
RUN pnpm install --frozen-lockfile

# ── development ───────────────────────────────────────────────────────────────
FROM base AS development
COPY --from=deps /app/node_modules                    ./node_modules
COPY --from=deps /app/src/taktflow-api/node_modules   ./src/taktflow-api/node_modules
COPY . .
EXPOSE 3000

# ── builder ───────────────────────────────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter @taktflow/domain       build
RUN pnpm --filter @taktflow/abstractions build
RUN pnpm --filter @taktflow/application  build
RUN pnpm --filter @taktflow/persistence  build
RUN pnpm --filter @taktflow/infra        build
RUN pnpm --filter @taktflow/api          build

# ── production ────────────────────────────────────────────────────────────────
FROM node:22-alpine AS production
RUN apk add --no-cache python3 make g++ && npm install -g pnpm
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/src      ./src
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/package.json        ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/pnpm-lock.yaml      ./

RUN pnpm install --frozen-lockfile --prod

EXPOSE 3000
CMD ["node", "src/taktflow-api/dist/server.js"]
