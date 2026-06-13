import { z } from 'zod';

import { PaginationSchema } from '@application/requests/pagination.request.js';

export const ProduceEventSchema = z.object({
  topicId:        z.string().uuid(),
  payload:        z.record(z.unknown()),
  idempotencyKey: z.string().uuid().optional(),
});

export const AcknowledgeEventSchema = z.object({
  status: z.enum(['success', 'failed']),
  error:  z.string().optional(),
});

export const ListEventsSchema = PaginationSchema.extend({
  topicId: z.string().uuid().optional(),
});
