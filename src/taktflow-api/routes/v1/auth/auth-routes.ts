import type { FastifyInstance } from 'fastify';

import {
  LoginSchema,
  RefreshTokenSchema,
  LoginResponseSchema,
  RefreshTokenResponseSchema,
} from '@application/validators/auth-validators.js';
import { RegisterTenantSchema } from '@application/validators/tenant-validators.js';
import { LoginResponse, RefreshTokenResponse } from '@application/responses/auth/login.response.js';

import { jwtMiddleware } from '../../../middleware/jwt-middleware.js';
import { zodToJsonSchema, ErrorResponseSchema } from '../../../schemas/api-schemas.js';

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
    const result = await app.handlers.registerTenant.handle(body);
    reply.code(201).send(new LoginResponse(result));
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
    const result = await app.handlers.login.handle(body);
    reply.send(new LoginResponse(result));
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
    const result = await app.handlers.refresh.handle(body);
    reply.send(new RefreshTokenResponse(result));
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
    await app.handlers.logout.handle({
      userId:   request.userId!,
      tenantId: request.tenantId!,
    });
    reply.code(204).send();
  });
}
