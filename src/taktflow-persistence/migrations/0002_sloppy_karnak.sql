ALTER TABLE "consumers" ALTER COLUMN "url" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "consumers" ADD COLUMN "type" varchar(20) DEFAULT 'push' NOT NULL;