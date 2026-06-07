import { z } from 'zod';

const ServerSchema = z.object({
  NODE_ENV:              z.enum(['development', 'production', 'test']),
  PORT:                  z.coerce.number(),
  LOG_LEVEL:             z.enum(['trace', 'debug', 'info', 'warn', 'error']),
  DASHBOARD_URL:         z.string().url(),
  RESEND_API_KEY:        z.string(),
  MAX_PAYLOAD_SIZE_BYTES: z.coerce.number().int().positive(),
  RATE_LIMIT_MAX:         z.coerce.number().int().positive(),
  RATE_LIMIT_WINDOW:      z.string(),
  DEFAULT_PAGE_SIZE:      z.coerce.number().int().positive(),
  MAX_PAGE_SIZE:          z.coerce.number().int().positive(),
});

export const serverConfig = ServerSchema.parse(process.env);
