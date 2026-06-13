import { z } from 'zod';

import {
  CreatePushConsumerSchema,
  CreatePullConsumerSchema,
  UpdateConsumerSchema,
} from '@application/validators/consumer-validators.js';
import { PaginationSchema } from '@api/swagger/pagination-schema.js';
import { zodToJsonSchema, paginatedResponseSchema, ErrorResponseSchema } from '@api/swagger/api-schemas.js';

const idParams = { type: 'object', properties: { id: { type: 'string', format: 'uuid' } }, required: ['id'] } as const;

export const ListConsumersQuerySchema = PaginationSchema.extend({
  topicId: z.string().uuid().optional(),
});

const ConsumerSummarySchema = z.object({
  id:          z.string().uuid(),
  topicId:     z.string().uuid(),
  name:        z.string(),
  type:        z.enum(['push', 'pull']),
  url:         z.string().nullable(),
  environment: z.string(),
  status:      z.string(),
  createdAt:   z.string().datetime(),
  updatedAt:   z.string().datetime(),
});

const ConsumerDetailSchema = z.object({
  id:          z.string().uuid(),
  topicId:     z.string().uuid(),
  name:        z.string(),
  type:        z.enum(['push', 'pull']),
  url:         z.string().nullable(),
  environment: z.string(),
  status:      z.string(),
  createdAt:   z.string().datetime(),
  updatedAt:   z.string().datetime(),
});

const CreatePushConsumerResponseSchema = z.object({
  id:          z.string().uuid(),
  topicId:     z.string().uuid(),
  name:        z.string(),
  type:        z.literal('push'),
  url:         z.string(),
  environment: z.string(),
  status:      z.string(),
  createdAt:   z.string().datetime(),
});

const CreatePullConsumerResponseSchema = z.object({
  id:          z.string().uuid(),
  topicId:     z.string().uuid(),
  name:        z.string(),
  type:        z.literal('pull'),
  environment: z.string(),
  status:      z.string(),
  createdAt:   z.string().datetime(),
});

const ConsumerHealthSchema = z.object({
  consumerId: z.string().uuid(),
  total:      z.number().int(),
  pending:    z.number().int(),
  processing: z.number().int(),
  delivered:  z.number().int(),
  failed:     z.number().int(),
  deadLetter: z.number().int(),
});

export const consumerSchemas = {
  createPush: {
    tags:    ['Consumers'],
    summary: 'Register a push consumer',
    body:    zodToJsonSchema(CreatePushConsumerSchema),
    response: {
      201: zodToJsonSchema(CreatePushConsumerResponseSchema),
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
  createPull: {
    tags:    ['Consumers'],
    summary: 'Register a pull consumer',
    body:    zodToJsonSchema(CreatePullConsumerSchema),
    response: {
      201: zodToJsonSchema(CreatePullConsumerResponseSchema),
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
  list: {
    tags:        ['Consumers'],
    summary:     'List consumers',
    querystring: zodToJsonSchema(ListConsumersQuerySchema),
    response: {
      200: zodToJsonSchema(paginatedResponseSchema(ConsumerSummarySchema)),
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
  getById: {
    tags:    ['Consumers'],
    summary: 'Get consumer detail',
    params:  idParams,
    response: {
      200: zodToJsonSchema(ConsumerDetailSchema),
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
  update: {
    tags:    ['Consumers'],
    summary: 'Update consumer',
    params:  idParams,
    body:    zodToJsonSchema(UpdateConsumerSchema),
    response: {
      200: zodToJsonSchema(ConsumerDetailSchema),
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
  delete: {
    tags:    ['Consumers'],
    summary: 'Delete consumer',
    params:  idParams,
    response: {
      204: { type: 'null', description: 'Deleted' },
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
  pause: {
    tags:    ['Consumers'],
    summary: 'Pause consumer',
    params:  idParams,
    response: {
      200: zodToJsonSchema(ConsumerDetailSchema),
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
  resume: {
    tags:    ['Consumers'],
    summary: 'Resume consumer',
    params:  idParams,
    response: {
      200: zodToJsonSchema(ConsumerDetailSchema),
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
  health: {
    tags:    ['Consumers'],
    summary: 'Get consumer delivery health',
    params:  idParams,
    response: {
      200: zodToJsonSchema(ConsumerHealthSchema),
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
};
