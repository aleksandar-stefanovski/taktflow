import type { FastifyInstance } from 'fastify';

import {
  LoginSchema,
  RefreshTokenSchema,
} from '@taktflow/application/validators/auth-validators.js';
import { RegisterTenantSchema } from '@taktflow/application/validators/tenant-validators.js';
import { RefreshTokenResponse } from '@taktflow/application/responses/auth/refresh-token.response.js';

import { jwtMiddleware } from '@api/middleware/jwt-middleware.js';
import { authSchemas }   from './auth.schemas.js';
import { HTTP_STATUS }   from '@api/constants/http.constants.js';

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post('/register', { schema: authSchemas.register }, async (request, reply) => {
    const body   = RegisterTenantSchema.parse(request.body);
    const result = await app.services.auth.register(body);
    reply.code(HTTP_STATUS.CREATED).send(result);
  });

  app.post('/login', { schema: authSchemas.login }, async (request, reply) => {
    const body   = LoginSchema.parse(request.body);
    const result = await app.services.auth.login(body);
    reply.send(result);
  });

  app.post('/refresh', { schema: authSchemas.refresh }, async (request, reply) => {
    const body   = RefreshTokenSchema.parse(request.body);
    const result = await app.services.auth.refresh(body);
    reply.send(RefreshTokenResponse.mapFromEntity(result));
  });

  app.post('/logout', { schema: authSchemas.logout, preHandler: [jwtMiddleware] }, async (request, reply) => {
    await app.services.auth.logout({
      userId:   request.userId!,
      tenantId: request.tenantId!,
    });
    reply.code(HTTP_STATUS.NO_CONTENT).send();
  });
}
