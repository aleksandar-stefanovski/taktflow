import type { LoginSchema, RefreshTokenSchema } from '@application/validators/auth-validators.js';
import type { z } from 'zod';

export type LoginRequest = z.infer<typeof LoginSchema>;
export type RefreshTokenRequest = z.infer<typeof RefreshTokenSchema>;
