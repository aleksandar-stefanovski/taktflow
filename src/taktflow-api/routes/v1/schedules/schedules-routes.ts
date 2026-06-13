import type { FastifyInstance } from 'fastify';

import { CreateScheduleSchema }     from '@taktflow/application/validators/schedule-validators.js';
import { PaginationSchema }         from '@api/swagger/pagination-schema.js';
import { CreateScheduleResponse }   from '@taktflow/application/responses/schedules/create-schedule.response.js';
import { ScheduleSummaryResponse }  from '@taktflow/application/responses/schedules/schedule-summary.response.js';

import { jwtMiddleware }   from '@api/middleware/jwt-middleware.js';
import { scheduleSchemas } from './schedules.schemas.js';
import { HTTP_STATUS }     from '@api/constants/http.constants.js';

export async function schedulesRoutes(app: FastifyInstance): Promise<void> {
  app.post('/', { schema: scheduleSchemas.create, preHandler: [jwtMiddleware] }, async (request, reply) => {
    const body     = CreateScheduleSchema.parse(request.body);
    const schedule = await app.services.schedules.create({
      ...body,
      tenantId: request.tenantId!,
    });
    reply.code(HTTP_STATUS.CREATED).send(CreateScheduleResponse.mapFromEntity(schedule));
  });

  app.get('/', { schema: scheduleSchemas.list, preHandler: [jwtMiddleware] }, async (request, reply) => {
    const query  = PaginationSchema.parse(request.query);
    const result = await app.services.schedules.list({
      ...query,
      tenantId: request.tenantId!,
    });
    reply.send({ ...result, items: result.items.map(ScheduleSummaryResponse.mapFromEntity) });
  });
}
