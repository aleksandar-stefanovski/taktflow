UPDATE consumers
SET config = (config - 'retryInitialDelay')
  || jsonb_build_object('retryInitialDelayMs', (config->>'retryInitialDelay')::int * 1000)
WHERE config ? 'retryInitialDelay';
