UPDATE consumers
SET config = (config - 'timeoutSeconds') || jsonb_build_object('timeoutMs', (config->>'timeoutSeconds')::int * 1000)
WHERE config ? 'timeoutSeconds';
