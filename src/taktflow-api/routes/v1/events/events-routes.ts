import type { FastifyInstance } from 'fastify';

import {
  ProduceEventSchema,
  ListEventsSchema,
  AcknowledgeEventSchema,
  ProduceEventResponseSchema,
  GetEventDetailResponseSchema,
  ListEventsResponseSchema,
  ConsumedEventsResponseSchema,
} from '@application/validators/event-validators.js';
import { ConsumeEventsQuerySchema } from '@application/validators/tenant-validators.js';
import { EventMapper } from '@application/mappers/event-mapper.js';
import { ProduceEventResponse } from '@application/responses/events/produce-event.response.js';
import { ConsumedEventsResponse } from '@application/responses/events/consumed-events.response.js';

import { apiKeyMiddleware } from '../../../middleware/api-key-middleware.js';
import { jwtMiddleware }    from '../../../middleware/jwt-middleware.js';
import { zodToJsonSchema, ErrorResponseSchema } from '../../../schemas/api-schemas.js';

export async function eventsRoutes(app: FastifyInstance): Promise<void> {
  app.post('/', {
    schema: {
      tags:        ['Events'],
      summary:     'Produce an event',
      security:    [{ apiKey: [] }],
      body:        zodToJsonSchema(ProduceEventSchema),
      response: {
        201: zodToJsonSchema(ProduceEventResponseSchema),
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [apiKeyMiddleware],
  }, async (request, reply) => {
    const body  = ProduceEventSchema.parse(request.body);
    const event = await app.handlers.produceEvent.handle({
      ...body,
      tenantId: request.tenantId!,
    });
    reply.code(201).send(new ProduceEventResponse(event));
  });

  app.get('/', {
    schema: {
      tags:        ['Events'],
      summary:     'List events',
      querystring: zodToJsonSchema(ListEventsSchema),
      response: {
        200: zodToJsonSchema(ListEventsResponseSchema),
        401: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [jwtMiddleware],
  }, async (request, reply) => {
    const query  = ListEventsSchema.parse(request.query);
    const result = await app.handlers.listEvents.handle({
      ...query,
      tenantId: request.tenantId!,
    });
    reply.send(EventMapper.toListResponse(result));
  });

  app.get('/consume', {
    schema: {
      tags:        ['Events'],
      summary:     'Claim pending events for a consumer (pull delivery)',
      querystring: zodToJsonSchema(ConsumeEventsQuerySchema),
      response: {
        200: zodToJsonSchema(ConsumedEventsResponseSchema),
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [jwtMiddleware],
  }, async (request, reply) => {
    const query  = ConsumeEventsQuerySchema.parse(request.query);
    const events = await app.handlers.consumeEvents.handle(
      query.consumerId,
      request.tenantId!,
      query.limit,
    );
    reply.send(new ConsumedEventsResponse(events));
  });

  app.post('/:id/acknowledge', {
    schema: {
      tags:    ['Events'],
      summary: 'Acknowledge event delivery',
      security: [{ apiKey: [] }],
      params:  { type: 'object', properties: { id: { type: 'string', format: 'uuid' } }, required: ['id'] },
      body:    zodToJsonSchema(AcknowledgeEventSchema),
      response: {
        204: { type: 'null', description: 'Acknowledged' },
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [apiKeyMiddleware],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body   = AcknowledgeEventSchema.parse(request.body);
    await app.handlers.acknowledgeEvent.handle(id, {
      ...body,
      tenantId: request.tenantId!,
    });
    reply.code(204).send();
  });

  app.get('/:id', {
    schema: {
      tags:    ['Events'],
      summary: 'Get event detail',
      params:  { type: 'object', properties: { id: { type: 'string', format: 'uuid' } }, required: ['id'] },
      response: {
        200: zodToJsonSchema(GetEventDetailResponseSchema),
        401: ErrorResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [jwtMiddleware],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const event  = await app.handlers.getEventDetail.handle(id, request.tenantId!);
    reply.send(EventMapper.toDetailResponse(event));
  });
}
