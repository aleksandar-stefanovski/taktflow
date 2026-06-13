import { z } from 'zod';

import { ProduceEventSchema, AcknowledgeEventSchema } from '@taktflow/application/validators/event-validators.js';
import { ConsumeEventsQuerySchema }                   from '@taktflow/application/validators/tenant-validators.js';
import { PaginationSchema }                           from '@api/swagger/pagination-schema.js';
import { zodToJsonSchema, paginatedResponseSchema, ErrorResponseSchema } from '@api/swagger/api-schemas.js';

const idParams = { type: 'object', properties: { id: { type: 'string', format: 'uuid' } }, required: ['id'] } as const;

export const ListEventsSchema = PaginationSchema.extend({
  topicId: z.string().uuid().optional(),
});

const ProduceEventResponseSchema = z.object({
  eventId:   z.string().uuid(),
  topicId:   z.string().uuid(),
  status:    z.string(),
  source:    z.string(),
  createdAt: z.string().datetime(),
});

const EventSummarySchema = z.object({
  id:          z.string().uuid(),
  topicId:     z.string().uuid(),
  status:      z.string(),
  source:      z.string(),
  scheduledAt: z.string().datetime(),
  processedAt: z.string().datetime().nullable(),
  createdAt:   z.string().datetime(),
});

const GetEventDetailSchema = z.object({
  id:             z.string().uuid(),
  topicId:        z.string().uuid(),
  status:         z.string(),
  source:         z.string(),
  payload:        z.record(z.unknown()),
  checksum:       z.string(),
  idempotencyKey: z.string().uuid().nullable(),
  scheduledAt:    z.string().datetime(),
  startedAt:      z.string().datetime().nullable(),
  processedAt:    z.string().datetime().nullable(),
  createdAt:      z.string().datetime(),
  updatedAt:      z.string().datetime(),
});

const ConsumedEventsResponseSchema = z.object({
  items: z.array(z.object({
    id:          z.string().uuid(),
    eventId:     z.string().uuid(),
    consumerId:  z.string().uuid(),
    topicId:     z.string().uuid(),
    payload:     z.record(z.unknown()),
    attempt:     z.number().int(),
    scheduledAt: z.string().datetime(),
  })),
  count: z.number().int(),
});

export const eventSchemas = {
  produce: {
    tags:     ['Events'],
    summary:  'Produce an event',
    security: [{ apiKey: [] }],
    body:     zodToJsonSchema(ProduceEventSchema),
    response: {
      201: zodToJsonSchema(ProduceEventResponseSchema),
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
  list: {
    tags:        ['Events'],
    summary:     'List events',
    querystring: zodToJsonSchema(ListEventsSchema),
    response: {
      200: zodToJsonSchema(paginatedResponseSchema(EventSummarySchema)),
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
  consume: {
    tags:        ['Events'],
    summary:     'Claim pending events for a consumer (pull delivery)',
    querystring: zodToJsonSchema(ConsumeEventsQuerySchema),
    response: {
      200: zodToJsonSchema(ConsumedEventsResponseSchema),
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
  acknowledge: {
    tags:     ['Events'],
    summary:  'Acknowledge event delivery',
    security: [{ apiKey: [] }],
    params:   idParams,
    body:     zodToJsonSchema(AcknowledgeEventSchema),
    response: {
      204: { type: 'null', description: 'Acknowledged' },
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
  getById: {
    tags:    ['Events'],
    summary: 'Get event detail',
    params:  idParams,
    response: {
      200: zodToJsonSchema(GetEventDetailSchema),
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
};
