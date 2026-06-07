import type { CreateScheduleSchema } from '../../validators/schedule-validators.js';
import type { z } from 'zod';

export type CreateScheduleRequest = z.infer<typeof CreateScheduleSchema>;
