import type { FastifyInstance } from 'fastify';

import { DashboardMetricsResponseSchema } from '@application/validators/dashboard-validators.js';
import { DashboardMetricsResponse } from '@application/responses/metrics/dashboard-metrics.response.js';

import { jwtMiddleware } from '@api/middleware/jwt-middleware.js';
import { zodToJsonSchema, ErrorResponseSchema } from '@api/schemas/api-schemas.js';

export async function dashboardRoutes(app: FastifyInstance): Promise<void> {
  app.get('/metrics', {
    schema: {
      tags:    ['Dashboard'],
      summary: 'Get dashboard metrics for the current tenant',
      response: {
        200: zodToJsonSchema(DashboardMetricsResponseSchema),
        401: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [jwtMiddleware],
  }, async (request, reply) => {
    const metrics = await app.services.dashboard.getMetrics(request.tenantId!);
    reply.send(DashboardMetricsResponse.mapFromEntity(metrics));
  });
}
