import type { FastifyInstance } from 'fastify';

import {
  CreateUserSchema,
  UpdateUserSchema,
  ChangePasswordSchema,
} from '@application/validators/user-validators.js';
import { UserResponse } from '@application/responses/users/user.response.js';

import { jwtMiddleware } from '@api/middleware/jwt-middleware.js';
import { userSchemas }   from './users.schemas.js';
import { HTTP_STATUS }   from '@api/constants/http.constants.js';

export async function usersRoutes(app: FastifyInstance): Promise<void> {
  app.post('/', { schema: userSchemas.create, preHandler: [jwtMiddleware] }, async (request, reply) => {
    const body = CreateUserSchema.parse(request.body);
    const user = await app.services.users.create({
      ...body,
      tenantId: request.tenantId!,
    });
    reply.code(HTTP_STATUS.CREATED).send(UserResponse.mapFromEntity(user));
  });

  app.get('/me', { schema: userSchemas.getMe, preHandler: [jwtMiddleware] }, async (request, reply) => {
    const user = await app.services.users.getCurrent(
      request.userId!,
      request.tenantId!,
    );
    reply.send(UserResponse.mapFromEntity(user));
  });

  app.put('/me', { schema: userSchemas.updateMe, preHandler: [jwtMiddleware] }, async (request, reply) => {
    const body = UpdateUserSchema.parse(request.body);
    const user = await app.services.users.update({
      ...body,
      userId:   request.userId!,
      tenantId: request.tenantId!,
    });
    reply.send(UserResponse.mapFromEntity(user));
  });

  app.put('/me/password', { schema: userSchemas.changePassword, preHandler: [jwtMiddleware] }, async (request, reply) => {
    const body = ChangePasswordSchema.parse(request.body);
    await app.services.users.changePassword({
      ...body,
      userId:   request.userId!,
      tenantId: request.tenantId!,
    });
    reply.code(HTTP_STATUS.NO_CONTENT).send();
  });

  app.delete('/me', { schema: userSchemas.deleteMe, preHandler: [jwtMiddleware] }, async (request, reply) => {
    await app.services.users.delete(request.userId!, request.tenantId!);
    reply.code(HTTP_STATUS.NO_CONTENT).send();
  });
}
