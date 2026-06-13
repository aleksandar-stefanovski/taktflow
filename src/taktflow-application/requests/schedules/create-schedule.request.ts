import type { CreateScheduleSchema } from '@application/validators/schedule-validators.js';
import type { z } from 'zod';

export type CreateScheduleRequest = z.infer<typeof CreateScheduleSchema>;
