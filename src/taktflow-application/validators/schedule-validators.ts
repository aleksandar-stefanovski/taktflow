import { z } from 'zod';

import { paginatedResponseSchema } from './pagination-validators.js';

export const CreateScheduleSchema = z.object({
  topicId:     z.string().uuid(),
  cron:        z.string().min(9).max(100),
  payload:     z.record(z.unknown()).default({}),
  environment: z.enum(['development', 'staging', 'production']),
});

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

export const CreateScheduleResponseSchema = ScheduleSummarySchema;

export const ListSchedulesResponseSchema = paginatedResponseSchema(ScheduleSummarySchema);
