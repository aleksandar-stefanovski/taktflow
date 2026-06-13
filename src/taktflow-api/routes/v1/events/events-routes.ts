import type { FastifyInstance } from 'fastify';

import { ProduceEventSchema, AcknowledgeEventSchema } from '@application/validators/event-validators.js';
import { ConsumeEventsQuerySchema }  from '@application/validators/tenant-validators.js';
import { ProduceEventResponse }      from '@application/responses/events/produce-event.response.js';
import { ConsumedEventResponse }     from '@application/responses/events/consumed-event.response.js';
import { EventSummaryResponse }      from '@application/responses/events/event-summary.response.js';
import { GetEventDetailResponse }    from '@application/responses/events/get-event-detail.response.js';

import { apiKeyMiddleware } from '@api/middleware/api-key-middleware.js';
import { jwtMiddleware }    from '@api/middleware/jwt-middleware.js';
import { eventSchemas, ListEventsSchema } from './events.schemas.js';
import { HTTP_STATUS }      from '@api/constants/http.constants.js';

export async function eventsRoutes(app: FastifyInstance): Promise<void> {
  app.post('/', { schema: eventSchemas.produce, preHandler: [apiKeyMiddleware] }, async (request, reply) => {
    const body  = ProduceEventSchema.parse(request.body);
    const event = await app.services.events.produce({
      ...body,
      tenantId: request.tenantId!,
    });
    reply.code(HTTP_STATUS.CREATED).send(ProduceEventResponse.mapFromEntity(event));
  });

  app.get('/', { schema: eventSchemas.list, preHandler: [jwtMiddleware] }, async (request, reply) => {
    const query  = ListEventsSchema.parse(request.query);
    const result = await app.services.events.list({
      ...query,
      tenantId: request.tenantId!,
    });
    reply.send({ ...result, items: result.items.map(EventSummaryResponse.mapFromEntity) });
  });

  app.get('/consume', { schema: eventSchemas.consume, preHandler: [jwtMiddleware] }, async (request, reply) => {
    const query  = ConsumeEventsQuerySchema.parse(request.query);
    const events = await app.services.consumers.consume(
      query.consumerId,
      request.tenantId!,
      query.limit,
    );
    reply.send({ items: events.map(ConsumedEventResponse.mapFromEntity), count: events.length });
  });

  app.post('/:id/acknowledge', { schema: eventSchemas.acknowledge, preHandler: [apiKeyMiddleware] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body   = AcknowledgeEventSchema.parse(request.body);
    await app.services.consumers.acknowledge(id, {
      ...body,
      tenantId: request.tenantId!,
    });
    reply.code(HTTP_STATUS.NO_CONTENT).send();
  });

  app.get('/:id', { schema: eventSchemas.getById, preHandler: [jwtMiddleware] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const event  = await app.services.events.getById(id, request.tenantId!);
    reply.send(GetEventDetailResponse.mapFromEntity(event));
  });
}
