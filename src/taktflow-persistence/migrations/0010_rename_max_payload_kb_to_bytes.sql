UPDATE topics
SET config = (config - 'maxPayloadKb') || jsonb_build_object('maxPayloadBytes', (config->>'maxPayloadKb')::int * 1024)
WHERE config ? 'maxPayloadKb';

ALTER TABLE "topics" ALTER COLUMN "config" DROP DEFAULT;
