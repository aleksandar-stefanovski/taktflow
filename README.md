# Taktflow

A multi-tenant event pipeline platform built with Node.js and TypeScript. Taktflow lets you produce events to topics and deliver them reliably to registered consumer endpoints via HTTP webhooks — with retry logic, dead-letter queuing, scheduling, and per-tenant isolation.

## Architecture

The platform is split into two runtimes and follows clean architecture principles:

- **API** (`src/taktflow-api`) — Fastify HTTP server. Handles authentication, tenant management, topic/consumer/event management, and exposes a Swagger UI at `/docs`.
- **Worker** (`src/taktflow-worker`) — Background process. Claims pending events from the queue and delivers them to consumer webhook URLs with configurable retry and backoff.

### Layer structure

```
src/taktflow-api              HTTP layer — routes, middleware, Swagger schemas
src/taktflow-application      Handlers, commands, queries, DTOs, validators, mappers
src/taktflow-worker           Worker engine — queue polling and event delivery
src/taktflow-domain           Entities, interfaces, value objects, exceptions
src/taktflow-infrastructure   Queue engine, email, external service integrations
src/taktflow-persistence      Drizzle ORM repositories, schema, migrations
packages/taktflow-types       Shared TypeScript types and enums
packages/taktflow-utils       Shared pure utilities
```

## API surface

All routes are versioned under `/v1`. Authentication is via JWT bearer token (dashboard) or API key (event production from client SDKs).

| Group | Description |
|---|---|
| `POST /v1/auth/login` | Log in and receive access + refresh tokens |
| `POST /v1/auth/refresh` | Rotate refresh token |
| `GET/PATCH /v1/tenants/me` | Tenant profile and settings |
| `GET /v1/tenants/me/usage` | Event and consumer usage stats |
| `POST /v1/users` | Register a new user |
| `GET /v1/users/me` | Current user profile |
| `POST /v1/api-keys` | Create an API key for event production |
| `GET /v1/api-keys` | List API keys |
| `GET /v1/api-keys/:id` | Get a single API key |
| `POST /v1/topics` | Create a topic |
| `GET /v1/topics` | List topics |
| `POST /v1/consumers` | Register a consumer webhook |
| `GET /v1/consumers` | List consumers |
| `GET /v1/consumers/:id/health` | Delivery health stats for a consumer |
| `POST /v1/events` | Produce an event (API key auth) |
| `GET /v1/events` | List events with pagination |
| `GET /v1/events/:id` | Get event detail |
| `GET /v1/events/consumed` | Events consumed by a specific consumer |
| `POST /v1/schedules` | Schedule a recurring event |
| `GET /v1/schedules` | List schedules |
| `GET /v1/dead-letter` | List dead-letter events |
| `GET /v1/dashboard` | Aggregated dashboard metrics |

## Stack

- **Runtime** — Node.js 22
- **Language** — TypeScript (ESM, strict)
- **HTTP framework** — Fastify 5
- **Database** — PostgreSQL 16 via Drizzle ORM
- **Validation** — Zod
- **Auth** — JWT (jose) + Argon2 password hashing
- **Package manager** — pnpm workspaces

## Running locally

Requires Docker and Docker Compose.

```bash
docker compose up
```

This starts three containers:

| Container | Port | Description |
|---|---|---|
| `postgres` | 5432 | PostgreSQL database |
| `api` | 3000 | HTTP API with hot-reload |
| `worker` | — | Background event delivery worker |

Swagger UI is available at [http://localhost:3000/docs](http://localhost:3000/docs) once the API is running.

## Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens (min 32 chars) |
| `API_KEY_SIGNING_SECRET` | Secret for HMAC API key signing (min 32 chars) |
| `DASHBOARD_URL` | Allowed CORS origin for the dashboard frontend |
| `WORKER_BATCH_SIZE` | Number of events claimed per worker poll cycle |
| `WORKER_POLL_INTERVAL_MS` | Milliseconds between worker poll cycles |
| `WORKER_DELIVERY_TIMEOUT_MS` | HTTP delivery timeout per event |
| `RESEND_API_KEY` | Resend API key for alert emails |
| `LOG_LEVEL` | Pino log level (`debug`, `info`, `warn`, `error`) |
