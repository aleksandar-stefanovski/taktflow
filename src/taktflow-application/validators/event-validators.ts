import { z } from 'zod';

import { PaginationSchema, paginatedResponseSchema } from './pagination-validators.js';

export const ProduceEventSchema = z.object({
  topicId:        z.string().uuid(),
  payload:        z.record(z.unknown()),
  idempotencyKey: z.string().uuid().optional(),
});

export const ListEventsSchema = PaginationSchema.extend({
  topicId: z.string().uuid().optional(),
});

export const ProduceEventResponseSchema = z.object({
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

export const GetEventDetailResponseSchema = z.object({
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

export const ListEventsResponseSchema = paginatedResponseSchema(EventSummarySchema);

export const AcknowledgeEventSchema = z.object({
  status: z.enum(['success', 'failed']),
  error:  z.string().optional(),
});

export const ConsumedEventsResponseSchema = z.object({
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
