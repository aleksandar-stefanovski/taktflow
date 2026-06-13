UPDATE "events" SET "source" = 'api' WHERE "source" = 'sdk';
ALTER TABLE "events" ALTER COLUMN "source" SET DEFAULT 'api';
