import { z } from 'zod';

import { CreateApiKeySchema } from '@taktflow/application/validators/api-key-validators.js';
import { PaginationSchema }   from '@api/swagger/pagination-schema.js';
import { zodToJsonSchema, paginatedResponseSchema, ErrorResponseSchema } from '@api/swagger/api-schemas.js';

const idParams = { type: 'object', properties: { id: { type: 'string', format: 'uuid' } }, required: ['id'] } as const;

const ApiKeySchema = z.object({
  id:          z.string().uuid(),
  name:        z.string(),
  keyPrefix:   z.string(),
  environment: z.string(),
  lastUsed:    z.string().datetime().nullable(),
  createdAt:   z.string().datetime(),
  updatedAt:   z.string().datetime(),
});

const CreateApiKeyResponseSchema = z.object({
  id:          z.string().uuid(),
  name:        z.string(),
  keyPrefix:   z.string(),
  environment: z.string(),
  rawKey:      z.string(),
  createdAt:   z.string().datetime(),
});

export const apiKeySchemas = {
  create: {
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
  list: {
    tags:        ['API Keys'],
    summary:     'List API keys',
    querystring: zodToJsonSchema(PaginationSchema),
    response: {
      200: zodToJsonSchema(paginatedResponseSchema(ApiKeySchema)),
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
  getById: {
    tags:    ['API Keys'],
    summary: 'Get API key detail',
    params:  idParams,
    response: {
      200: zodToJsonSchema(ApiKeySchema),
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
  delete: {
    tags:    ['API Keys'],
    summary: 'Revoke an API key',
    params:  idParams,
    response: {
      204: { type: 'null', description: 'Revoked' },
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
};
