import { z } from 'zod';

const DefaultsSchema = z.object({
  TOPIC_DEFAULT_RETENTION_DAYS: z.coerce.number().int().positive(),
  TOPIC_DEFAULT_MAX_PAYLOAD_BYTES: z.coerce.number().int().positive(),
  TOPIC_DEFAULT_ORDERING:       z.enum(['unordered', 'fifo']),
});

export const defaultsConfig = DefaultsSchema.parse(process.env);
