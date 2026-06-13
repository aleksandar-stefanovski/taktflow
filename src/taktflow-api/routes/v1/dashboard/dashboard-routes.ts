import type { FastifyInstance } from 'fastify';

import { DashboardMetricsResponse } from '@taktflow/application/responses/metrics/dashboard-metrics.response.js';

import { jwtMiddleware }    from '@api/middleware/jwt-middleware.js';
import { dashboardSchemas } from './dashboard.schemas.js';

export async function dashboardRoutes(app: FastifyInstance): Promise<void> {
  app.get('/metrics', { schema: dashboardSchemas.metrics, preHandler: [jwtMiddleware] }, async (request, reply) => {
    const metrics = await app.services.dashboard.getMetrics(request.tenantId!);
    reply.send(DashboardMetricsResponse.mapFromEntity(metrics));
  });
}
