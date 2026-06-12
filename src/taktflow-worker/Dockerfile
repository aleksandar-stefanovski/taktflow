# syntax=docker/dockerfile:1

# ── base ─────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS base
RUN npm install -g pnpm
WORKDIR /app

# ── deps ─────────────────────────────────────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY src/taktflow-abstractions/package.json   ./src/taktflow-abstractions/
COPY src/taktflow-api/package.json            ./src/taktflow-api/
COPY src/taktflow-worker/package.json         ./src/taktflow-worker/
COPY src/taktflow-application/package.json    ./src/taktflow-application/
COPY src/taktflow-domain/package.json         ./src/taktflow-domain/
COPY src/taktflow-infrastructure/package.json ./src/taktflow-infrastructure/
COPY src/taktflow-persistence/package.json    ./src/taktflow-persistence/
RUN pnpm install --frozen-lockfile

# ── development ───────────────────────────────────────────────────────────────
FROM base AS development
COPY --from=deps /app/node_modules                      ./node_modules
COPY --from=deps /app/src/taktflow-worker/node_modules  ./src/taktflow-worker/node_modules
COPY . .

# ── builder ───────────────────────────────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter @taktflow/domain       build
RUN pnpm --filter @taktflow/abstractions build
RUN pnpm --filter @taktflow/application  build
RUN pnpm --filter @taktflow/persistence  build
RUN pnpm --filter @taktflow/infra        build
RUN pnpm --filter @taktflow/worker       build

# ── production ────────────────────────────────────────────────────────────────
FROM node:22-alpine AS production
RUN npm install -g pnpm
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/src      ./src
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/package.json        ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/pnpm-lock.yaml      ./

RUN pnpm install --frozen-lockfile --prod

CMD ["node", "src/taktflow-worker/dist/worker.js"]
