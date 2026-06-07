import type { FastifyInstance } from 'fastify';

import {
  CreateApiKeySchema,
  CreateApiKeyResponseSchema,
  GetApiKeyResponseSchema,
  ListApiKeysResponseSchema,
} from '@application/validators/api-key-validators.js';
import { PaginationSchema } from '@application/validators/pagination-validators.js';
import { ApiKeyMapper } from '@application/mappers/api-key-mapper.js';

import { jwtMiddleware } from '../../../middleware/jwt-middleware.js';
import { zodToJsonSchema, ErrorResponseSchema } from '../../../schemas/api-schemas.js';

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
    const result = await app.handlers.createApiKey.handle({
      ...body,
      tenantId: request.tenantId!,
    });
    reply.code(201).send(ApiKeyMapper.toCreateResponse(result.apiKey, result.rawKey));
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
    const result = await app.handlers.listApiKeys.handle({
      ...query,
      tenantId: request.tenantId!,
    });
    reply.send(ApiKeyMapper.toListResponse(result));
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
    const apiKey = await app.handlers.getApiKey.handle(id, request.tenantId!);
    reply.send(ApiKeyMapper.toDetailResponse(apiKey));
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
    await app.handlers.deleteApiKey.handle(id, request.tenantId!);
    reply.code(204).send();
  });
}
