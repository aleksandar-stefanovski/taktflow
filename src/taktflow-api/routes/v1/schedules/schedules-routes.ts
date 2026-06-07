import type { FastifyInstance } from 'fastify';

import {
  CreateScheduleSchema,
  CreateScheduleResponseSchema,
  ListSchedulesResponseSchema,
} from '@application/validators/schedule-validators.js';
import { PaginationSchema } from '@api/schemas/pagination-schema.js';
import { CreateScheduleResponse } from '@application/responses/schedules/create-schedule.response.js';
import { ScheduleSummaryResponse } from '@application/responses/schedules/schedule-summary.response.js';

import { jwtMiddleware } from '@api/middleware/jwt-middleware.js';
import { zodToJsonSchema, ErrorResponseSchema } from '@api/schemas/api-schemas.js';

export async function schedulesRoutes(app: FastifyInstance): Promise<void> {
  app.post('/', {
    schema: {
      tags:    ['Schedules'],
      summary: 'Create a schedule',
      body:    zodToJsonSchema(CreateScheduleSchema),
      response: {
        201: zodToJsonSchema(CreateScheduleResponseSchema),
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [jwtMiddleware],
  }, async (request, reply) => {
    const body     = CreateScheduleSchema.parse(request.body);
    const schedule = await app.services.schedules.create({
      ...body,
      tenantId: request.tenantId!,
    });
    reply.code(201).send(CreateScheduleResponse.mapFromEntity(schedule));
  });

  app.get('/', {
    schema: {
      tags:        ['Schedules'],
      summary:     'List schedules',
      querystring: zodToJsonSchema(PaginationSchema),
      response: {
        200: zodToJsonSchema(ListSchedulesResponseSchema),
        401: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [jwtMiddleware],
  }, async (request, reply) => {
    const query  = PaginationSchema.parse(request.query);
    const result = await app.services.schedules.list({
      ...query,
      tenantId: request.tenantId!,
    });
    reply.send({ ...result, items: result.items.map(ScheduleSummaryResponse.mapFromEntity) });
  });
}
