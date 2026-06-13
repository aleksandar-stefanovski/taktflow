import { z } from 'zod';

import { CreateScheduleSchema } from '@taktflow/application/validators/schedule-validators.js';
import { PaginationSchema }     from '@api/swagger/pagination-schema.js';
import { zodToJsonSchema, paginatedResponseSchema, ErrorResponseSchema } from '@api/swagger/api-schemas.js';

const ScheduleSummarySchema = z.object({
  id:          z.string().uuid(),
  topicId:     z.string().uuid(),
  cron:        z.string(),
  payload:     z.record(z.unknown()),
  environment: z.string(),
  status:      z.string(),
  nextRun:     z.string().datetime().nullable(),
  createdAt:   z.string().datetime(),
});

export const scheduleSchemas = {
  create: {
    tags:    ['Schedules'],
    summary: 'Create a schedule',
    body:    zodToJsonSchema(CreateScheduleSchema),
    response: {
      201: zodToJsonSchema(ScheduleSummarySchema),
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
  list: {
    tags:        ['Schedules'],
    summary:     'List schedules',
    querystring: zodToJsonSchema(PaginationSchema),
    response: {
      200: zodToJsonSchema(paginatedResponseSchema(ScheduleSummarySchema)),
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
};
