ALTER TABLE "consumers" ADD COLUMN "alert_email" text;--> statement-breakpoint
ALTER TABLE "consumers" ADD COLUMN "alert_after_failures" integer NOT NULL DEFAULT 3;--> statement-breakpoint
ALTER TABLE "consumers" DROP COLUMN "config";
