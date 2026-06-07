import { z } from 'zod';

export const DashboardMetricsResponseSchema = z.object({
  tenantId:            z.string().uuid(),
  eventsToday:         z.number().int(),
  eventsTotal:         z.number().int(),
  successCount:        z.number().int(),
  failureCount:        z.number().int(),
  averageProcessingMs: z.number(),
  updatedAt:           z.string().datetime(),
});
