import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV:               z.enum(['development', 'production', 'test']).default('development'),
  PORT:                   z.coerce.number().default(3000),
  DATABASE_URL:           z.string().url(),
  JWT_ACCESS_SECRET:      z.string().min(32),
  JWT_REFRESH_SECRET:     z.string().min(32),
  API_KEY_SIGNING_SECRET: z.string().min(32),
  DASHBOARD_URL:          z.string().url(),
  LOG_LEVEL:              z.enum(['trace', 'debug', 'info', 'warn', 'error']).default('info'),
  RESEND_API_KEY:         z.string(),
  CLERK_SECRET_KEY:       z.string().optional(),
});

export const env = EnvSchema.parse(process.env);
export type Env = z.infer<typeof EnvSchema>;
