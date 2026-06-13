import { z } from 'zod';

import { LoginSchema, RefreshTokenSchema } from '@taktflow/application/validators/auth-validators.js';
import { RegisterTenantSchema }            from '@taktflow/application/validators/tenant-validators.js';
import { zodToJsonSchema, ErrorResponseSchema } from '@api/swagger/api-schemas.js';

const LoginUserSchema = z.object({
  id:        z.string().uuid(),
  email:     z.string().email(),
  firstName: z.string(),
  lastName:  z.string(),
  role:      z.string(),
});

const LoginResponseSchema = z.object({
  accessToken:  z.string(),
  refreshToken: z.string(),
  user:         LoginUserSchema,
});

const RefreshTokenResponseSchema = z.object({
  accessToken:  z.string(),
  refreshToken: z.string(),
});

export const authSchemas = {
  register: {
    tags:     ['Auth'],
    summary:  'Register a new tenant and admin user',
    security: [],
    body:     zodToJsonSchema(RegisterTenantSchema),
    response: {
      201: zodToJsonSchema(LoginResponseSchema),
      400: ErrorResponseSchema,
      409: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
  login: {
    tags:     ['Auth'],
    summary:  'Login and receive tokens',
    security: [],
    body:     zodToJsonSchema(LoginSchema),
    response: {
      200: zodToJsonSchema(LoginResponseSchema),
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
  refresh: {
    tags:     ['Auth'],
    summary:  'Refresh access token',
    security: [],
    body:     zodToJsonSchema(RefreshTokenSchema),
    response: {
      200: zodToJsonSchema(RefreshTokenResponseSchema),
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
  logout: {
    tags:    ['Auth'],
    summary: 'Logout and invalidate refresh token',
    response: {
      204: { type: 'null', description: 'Logged out' },
      401: ErrorResponseSchema,
    },
  },
};
