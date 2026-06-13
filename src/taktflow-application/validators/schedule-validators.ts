import { z } from 'zod';

export const CreateScheduleSchema = z.object({
  topicId:     z.string().uuid(),
  cron:        z.string().min(9).max(100),
  payload:     z.record(z.unknown()).default({}),
  environment: z.enum(['development', 'staging', 'production']),
});
