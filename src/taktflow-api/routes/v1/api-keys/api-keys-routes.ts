import type { FastifyInstance } from 'fastify';

import {
  CreateApiKeySchema,
  CreateApiKeyResponseSchema,
  GetApiKeyResponseSchema,
  ListApiKeysResponseSchema,
} from '@application/validators/api-key-validators.js';
import { PaginationSchema } from '@api/schemas/pagination-schema.js';
import { CreateApiKeyResponse } from '@application/responses/api-keys/create-api-key.response.js';
import { ApiKeyResponse } from '@application/responses/api-keys/api-key.response.js';

import { jwtMiddleware } from '@api/middleware/jwt-middleware.js';
import { zodToJsonSchema, ErrorResponseSchema } from '@api/schemas/api-schemas.js';

export async function apiKeysRoutes(app: FastifyInstance): Promise<void> {
  app.post('/', {
    schema: {
      tags:    ['API Keys'],
      summary: 'Create an API key',
      body:    zodToJsonSchema(CreateApiKeySchema),
      response: {
        201: zodToJsonSchema(CreateApiKeyResponseSchema),
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [jwtMiddleware],
  }, async (request, reply) => {
    const body   = CreateApiKeySchema.parse(request.body);
    const result = await app.services.apiKey.create({
      ...body,
      tenantId: request.tenantId!,
    });
    reply.code(201).send(CreateApiKeyResponse.mapFromEntity(result.apiKey, result.rawKey));
  });

  app.get('/', {
    schema: {
      tags:        ['API Keys'],
      summary:     'List API keys',
      querystring: zodToJsonSchema(PaginationSchema),
      response: {
        200: zodToJsonSchema(ListApiKeysResponseSchema),
        401: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [jwtMiddleware],
  }, async (request, reply) => {
    const query  = PaginationSchema.parse(request.query);
    const result = await app.services.apiKey.list({
      ...query,
      tenantId: request.tenantId!,
    });
    reply.send({ ...result, items: result.items.map(ApiKeyResponse.mapFromEntity) });
  });

  app.get('/:id', {
    schema: {
      tags:    ['API Keys'],
      summary: 'Get API key detail',
      params:  { type: 'object', properties: { id: { type: 'string', format: 'uuid' } }, required: ['id'] },
      response: {
        200: zodToJsonSchema(GetApiKeyResponseSchema),
        401: ErrorResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [jwtMiddleware],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const apiKey = await app.services.apiKey.getById(id, request.tenantId!);
    reply.send(ApiKeyResponse.mapFromEntity(apiKey));
  });

  app.delete('/:id', {
    schema: {
      tags:    ['API Keys'],
      summary: 'Revoke an API key',
      params:  { type: 'object', properties: { id: { type: 'string', format: 'uuid' } }, required: ['id'] },
      response: {
        204: { type: 'null', description: 'Revoked' },
        401: ErrorResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [jwtMiddleware],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await app.services.apiKey.delete(id, request.tenantId!);
    reply.code(204).send();
  });
}
