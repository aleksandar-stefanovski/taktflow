import { z } from 'zod';

export const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(8),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

const LoginUserSchema = z.object({
  id:        z.string().uuid(),
  email:     z.string().email(),
  firstName: z.string(),
  lastName:  z.string(),
  role:      z.string(),
});

export const LoginResponseSchema = z.object({
  accessToken:  z.string(),
  refreshToken: z.string(),
  user:         LoginUserSchema,
});

export const RefreshTokenResponseSchema = z.object({
  accessToken:  z.string(),
  refreshToken: z.string(),
});
