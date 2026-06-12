import { z } from 'zod';

const DatabaseSchema = z.object({
  DATABASE_URL:             z.string().url(),
  DB_POOL_MAX:              z.coerce.number().int().positive(),
  DB_IDLE_TIMEOUT_MS:       z.coerce.number().int().nonnegative(),
  DB_CONNECTION_TIMEOUT_MS: z.coerce.number().int().nonnegative(),
});

const parsed = DatabaseSchema.parse(process.env);

export const databaseConfig = {
  url:                parsed.DATABASE_URL,
  poolMax:            parsed.DB_POOL_MAX,
  idleTimeoutMs:      parsed.DB_IDLE_TIMEOUT_MS,
  connectionTimeoutMs: parsed.DB_CONNECTION_TIMEOUT_MS,
};
