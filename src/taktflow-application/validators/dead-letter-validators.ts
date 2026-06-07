import { z } from 'zod';

import { paginatedResponseSchema } from './pagination-validators.js';

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

export const ListDeadLetterEventsResponseSchema = paginatedResponseSchema(DeadLetterEventSchema);
