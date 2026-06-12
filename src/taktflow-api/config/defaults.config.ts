import { z } from 'zod';

const DefaultsSchema = z.object({
  ALERT_AFTER_FAILURES:         z.coerce.number().int().positive(),
  TOPIC_DEFAULT_RETENTION_DAYS: z.coerce.number().int().positive(),
  TOPIC_DEFAULT_MAX_PAYLOAD_KB: z.coerce.number().int().positive(),
  TOPIC_DEFAULT_ORDERING:       z.enum(['unordered', 'fifo']),
});

export const defaultsConfig = DefaultsSchema.parse(process.env);
