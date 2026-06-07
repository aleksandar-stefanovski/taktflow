import type { FastifyInstance } from 'fastify';

import {
  LoginSchema,
  RefreshTokenSchema,
  LoginResponseSchema,
  RefreshTokenResponseSchema,
} from '@application/validators/auth-validators.js';
import { RegisterTenantSchema } from '@application/validators/tenant-validators.js';
import { LoginResponse } from '@application/responses/auth/login.response.js';
import { RefreshTokenResponse } from '@application/responses/auth/refresh-token.response.js';

import { jwtMiddleware } from '@api/middleware/jwt-middleware.js';
import { zodToJsonSchema, ErrorResponseSchema } from '@api/schemas/api-schemas.js';

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post('/register', {
    schema: {
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
  }, async (request, reply) => {
    const body   = RegisterTenantSchema.parse(request.body);
    const result = await app.services.auth.register(body);
    reply.code(201).send(LoginResponse.mapFromEntity(result));
  });

  app.post('/login', {
    schema: {
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
  }, async (request, reply) => {
    const body   = LoginSchema.parse(request.body);
    const result = await app.services.auth.login(body);
    reply.send(LoginResponse.mapFromEntity(result));
  });

  app.post('/refresh', {
    schema: {
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
  }, async (request, reply) => {
    const body   = RefreshTokenSchema.parse(request.body);
    const result = await app.services.auth.refresh(body);
    reply.send(RefreshTokenResponse.mapFromEntity(result));
  });

  app.post('/logout', {
    schema: {
      tags:     ['Auth'],
      summary:  'Logout and invalidate refresh token',
      response: {
        204: { type: 'null', description: 'Logged out' },
        401: ErrorResponseSchema,
      },
    },
    preHandler: [jwtMiddleware],
  }, async (request, reply) => {
    await app.services.auth.logout({
      userId:   request.userId!,
      tenantId: request.tenantId!,
    });
    reply.code(204).send();
  });
}
