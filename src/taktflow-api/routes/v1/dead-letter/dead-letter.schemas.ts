import { z } from 'zod';

import { PaginationSchema } from '@api/swagger/pagination-schema.js';
import { zodToJsonSchema, paginatedResponseSchema, ErrorResponseSchema } from '@api/swagger/api-schemas.js';

const idParams = { type: 'object', properties: { id: { type: 'string', format: 'uuid' } }, required: ['id'] } as const;

const DeadLetterEventSchema = z.object({
  id:              z.string().uuid(),
  eventId:         z.string().uuid(),
  consumerId:      z.string().uuid(),
  eventDeliveryId: z.string().uuid(),
  failureReason:   z.string(),
  payloadSnapshot: z.record(z.unknown()),
  replayed:        z.boolean(),
  replayedAt:      z.string().datetime().nullable(),
  createdAt:       z.string().datetime(),
});

export const deadLetterSchemas = {
  list: {
    tags:        ['Events'],
    summary:     'List dead letter events',
    querystring: zodToJsonSchema(PaginationSchema),
    response: {
      200: zodToJsonSchema(paginatedResponseSchema(DeadLetterEventSchema)),
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
  replay: {
    tags:    ['Events'],
    summary: 'Replay a dead letter event',
    params:  idParams,
    response: {
      204: { type: 'null', description: 'Replayed' },
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
};
