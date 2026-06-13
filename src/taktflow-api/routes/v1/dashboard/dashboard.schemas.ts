import { z } from 'zod';

import { zodToJsonSchema, ErrorResponseSchema } from '@api/swagger/api-schemas.js';

const DashboardMetricsSchema = z.object({
  tenantId:            z.string().uuid(),
  eventsToday:         z.number().int(),
  eventsTotal:         z.number().int(),
  successCount:        z.number().int(),
  failureCount:        z.number().int(),
  averageProcessingMs: z.number(),
  updatedAt:           z.string().datetime(),
});

export const dashboardSchemas = {
  metrics: {
    tags:    ['Dashboard'],
    summary: 'Get dashboard metrics for the current tenant',
    response: {
      200: zodToJsonSchema(DashboardMetricsSchema),
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
};
