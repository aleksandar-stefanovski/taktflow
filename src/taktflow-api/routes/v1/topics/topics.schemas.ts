import { z } from 'zod';

import { CreateTopicSchema, UpdateTopicSchema } from '@taktflow/application/validators/topic-validators.js';
import { PaginationSchema }                     from '@api/swagger/pagination-schema.js';
import { zodToJsonSchema, paginatedResponseSchema, ErrorResponseSchema } from '@api/swagger/api-schemas.js';

const idParams = { type: 'object', properties: { id: { type: 'string', format: 'uuid' } }, required: ['id'] } as const;

const TopicConfigSchema = z.object({
  retentionDays: z.number().int(),
  ordering:      z.string(),
});

const TopicDetailSchema = z.object({
  id:        z.string().uuid(),
  name:      z.string(),
  config:    TopicConfigSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const TopicSummarySchema = z.object({
  id:        z.string().uuid(),
  name:      z.string(),
  config:    TopicConfigSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const topicSchemas = {
  create: {
    tags:    ['Topics'],
    summary: 'Create a topic',
    body:    zodToJsonSchema(CreateTopicSchema),
    response: {
      201: zodToJsonSchema(TopicDetailSchema),
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      409: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
  getById: {
    tags:    ['Topics'],
    summary: 'Get topic detail',
    params:  idParams,
    response: {
      200: zodToJsonSchema(TopicDetailSchema),
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
  update: {
    tags:    ['Topics'],
    summary: 'Update topic',
    params:  idParams,
    body:    zodToJsonSchema(UpdateTopicSchema),
    response: {
      200: zodToJsonSchema(TopicDetailSchema),
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      409: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
  delete: {
    tags:    ['Topics'],
    summary: 'Delete topic',
    params:  idParams,
    response: {
      204: { type: 'null', description: 'Deleted' },
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
  list: {
    tags:        ['Topics'],
    summary:     'List topics',
    querystring: zodToJsonSchema(PaginationSchema),
    response: {
      200: zodToJsonSchema(paginatedResponseSchema(TopicSummarySchema)),
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
};
