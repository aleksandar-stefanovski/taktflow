import type { FastifyInstance } from 'fastify';

import {
  CreateUserSchema,
  UpdateUserSchema,
  ChangePasswordSchema,
  UserResponseSchema,
} from '@application/validators/user-validators.js';
import { UserResponse } from '@application/responses/users/user.response.js';

import { jwtMiddleware } from '@api/middleware/jwt-middleware.js';
import { zodToJsonSchema, ErrorResponseSchema } from '@api/schemas/api-schemas.js';

export async function usersRoutes(app: FastifyInstance): Promise<void> {
  app.post('/', {
    schema: {
      tags:    ['Users'],
      summary: 'Create a user in the current tenant',
      body:    zodToJsonSchema(CreateUserSchema),
      response: {
        201: zodToJsonSchema(UserResponseSchema),
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        409: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [jwtMiddleware],
  }, async (request, reply) => {
    const body = CreateUserSchema.parse(request.body);
    const user = await app.services.users.create({
      ...body,
      tenantId: request.tenantId!,
    });
    reply.code(201).send(UserResponse.mapFromEntity(user));
  });

  app.get('/me', {
    schema: {
      tags:    ['Users'],
      summary: 'Get current user profile',
      response: {
        200: zodToJsonSchema(UserResponseSchema),
        401: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [jwtMiddleware],
  }, async (request, reply) => {
    const user = await app.services.users.getCurrent(
      request.userId!,
      request.tenantId!,
    );
    reply.send(UserResponse.mapFromEntity(user));
  });

  app.put('/me', {
    schema: {
      tags:    ['Users'],
      summary: 'Update current user profile',
      body:    zodToJsonSchema(UpdateUserSchema),
      response: {
        200: zodToJsonSchema(UserResponseSchema),
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [jwtMiddleware],
  }, async (request, reply) => {
    const body = UpdateUserSchema.parse(request.body);
    const user = await app.services.users.update({
      ...body,
      userId:   request.userId!,
      tenantId: request.tenantId!,
    });
    reply.send(UserResponse.mapFromEntity(user));
  });

  app.put('/me/password', {
    schema: {
      tags:    ['Users'],
      summary: 'Change current user password',
      body:    zodToJsonSchema(ChangePasswordSchema),
      response: {
        204: { type: 'null', description: 'Password changed' },
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [jwtMiddleware],
  }, async (request, reply) => {
    const body = ChangePasswordSchema.parse(request.body);
    await app.services.users.changePassword({
      ...body,
      userId:   request.userId!,
      tenantId: request.tenantId!,
    });
    reply.code(204).send();
  });
}
