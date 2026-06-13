import type { FastifyInstance } from 'fastify';

import { CreateApiKeySchema } from '@taktflow/application/validators/api-key-validators.js';
import { PaginationSchema }   from '@api/swagger/pagination-schema.js';
import { CreateApiKeyResponse } from '@taktflow/application/responses/api-keys/create-api-key.response.js';
import { ApiKeyResponse }       from '@taktflow/application/responses/api-keys/api-key.response.js';

import { jwtMiddleware }  from '@api/middleware/jwt-middleware.js';
import { apiKeySchemas }  from './api-keys.schemas.js';
import { HTTP_STATUS }    from '@api/constants/http.constants.js';

export async function apiKeysRoutes(app: FastifyInstance): Promise<void> {
  app.post('/', { schema: apiKeySchemas.create, preHandler: [jwtMiddleware] }, async (request, reply) => {
    const body   = CreateApiKeySchema.parse(request.body);
    const result = await app.services.apiKey.create({
      ...body,
      tenantId: request.tenantId!,
    });
    reply.code(HTTP_STATUS.CREATED).send(CreateApiKeyResponse.mapFromEntity(result.apiKey, result.rawKey));
  });

  app.get('/', { schema: apiKeySchemas.list, preHandler: [jwtMiddleware] }, async (request, reply) => {
    const query  = PaginationSchema.parse(request.query);
    const result = await app.services.apiKey.list({
      ...query,
      tenantId: request.tenantId!,
    });
    reply.send({ ...result, items: result.items.map(ApiKeyResponse.mapFromEntity) });
  });

  app.get('/:id', { schema: apiKeySchemas.getById, preHandler: [jwtMiddleware] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const apiKey = await app.services.apiKey.getById(id, request.tenantId!);
    reply.send(ApiKeyResponse.mapFromEntity(apiKey));
  });

  app.delete('/:id', { schema: apiKeySchemas.delete, preHandler: [jwtMiddleware] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await app.services.apiKey.delete(id, request.tenantId!);
    reply.code(HTTP_STATUS.NO_CONTENT).send();
  });
}
