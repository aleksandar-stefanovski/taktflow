import { z } from 'zod';

const DefaultsSchema = z.object({
  CONSUMER_DEFAULT_TIMEOUT_MS:             z.coerce.number().int().positive(),
  CONSUMER_DEFAULT_RETRY_ATTEMPTS:         z.coerce.number().int().positive(),
  CONSUMER_DEFAULT_RETRY_BACKOFF:          z.enum(['exponential', 'fixed', 'linear']),
  CONSUMER_DEFAULT_RETRY_INITIAL_DELAY_MS: z.coerce.number().int().positive(),
  CONSUMER_DEFAULT_ALERT_AFTER_FAILURES:   z.coerce.number().int().positive(),
  CONSUMER_DEFAULT_MAX_CONCURRENT:         z.coerce.number().int().positive(),
  TOPIC_DEFAULT_RETENTION_DAYS:            z.coerce.number().int().positive(),
  TOPIC_DEFAULT_MAX_PAYLOAD_KB:            z.coerce.number().int().positive(),
  TOPIC_DEFAULT_ORDERING:                  z.enum(['unordered', 'ordered']),
});

export const defaultsConfig = DefaultsSchema.parse(process.env);
