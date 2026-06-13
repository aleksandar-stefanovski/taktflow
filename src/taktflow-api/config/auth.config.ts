import { z } from 'zod';

const AuthSchema = z.object({
  JWT_ACCESS_SECRET:      z.string().min(32),
  JWT_REFRESH_SECRET:     z.string().min(32),
  API_KEY_SIGNING_SECRET: z.string().min(32),
  API_KEY_PREFIX:              z.string(),
  REFRESH_TOKEN_EXPIRY_DAYS:   z.coerce.number().int().positive(),
  JWT_ACCESS_TOKEN_EXPIRY:     z.string(),
  ARGON2_MEMORY_COST:          z.coerce.number().int().positive(),
  ARGON2_TIME_COST:            z.coerce.number().int().positive(),
  ARGON2_PARALLELISM:          z.coerce.number().int().positive(),
});

export const authConfig = AuthSchema.parse(process.env);
