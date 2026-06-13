CREATE UNIQUE INDEX IF NOT EXISTS "events_idempotency_key_tenant_id_unique"
ON "events" ("idempotency_key", "tenant_id")
WHERE "idempotency_key" IS NOT NULL;
