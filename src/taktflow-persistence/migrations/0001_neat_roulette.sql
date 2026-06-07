ALTER TABLE "consumers" ALTER COLUMN "config" SET DEFAULT '{"timeoutSeconds":30,"retryAttempts":3,"retryBackoff":"exponential","retryInitialDelay":30,"alertAfterFailures":3,"alertEmail":null,"maxConcurrent":10}'::jsonb;--> statement-breakpoint
ALTER TABLE "api_keys" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "consumers" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "topics" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "schedules" ADD COLUMN "deleted_at" timestamp with time zone;