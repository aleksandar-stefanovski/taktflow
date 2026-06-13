import type { FastifyInstance } from 'fastify';

import {
  CreatePushConsumerSchema,
  CreatePullConsumerSchema,
  UpdateConsumerSchema,
} from '@taktflow/application/validators/consumer-validators.js';
import { CreatePushConsumerResponse } from '@taktflow/application/responses/consumers/create-push-consumer.response.js';
import { CreatePullConsumerResponse } from '@taktflow/application/responses/consumers/create-pull-consumer.response.js';
import { ConsumerDetailResponse }     from '@taktflow/application/responses/consumers/consumer-detail.response.js';
import { ConsumerHealthResponse }     from '@taktflow/application/responses/consumers/consumer-health.response.js';
import { ConsumerSummaryResponse }    from '@taktflow/application/responses/consumers/consumer-summary.response.js';

import { jwtMiddleware }                               from '@api/middleware/jwt-middleware.js';
import { consumerSchemas, ListConsumersQuerySchema }   from './consumers.schemas.js';
import { HTTP_STATUS }                                 from '@api/constants/http.constants.js';

export async function consumersRoutes(app: FastifyInstance): Promise<void> {
  app.post('/push', { schema: consumerSchemas.createPush, preHandler: [jwtMiddleware] }, async (request, reply) => {
    const body     = CreatePushConsumerSchema.parse(request.body);
    const consumer = await app.services.consumers.createPush({
      ...body,
      tenantId: request.tenantId!,
    });
    reply.code(HTTP_STATUS.CREATED).send(CreatePushConsumerResponse.mapFromEntity(consumer));
  });

  app.post('/pull', { schema: consumerSchemas.createPull, preHandler: [jwtMiddleware] }, async (request, reply) => {
    const body     = CreatePullConsumerSchema.parse(request.body);
    const consumer = await app.services.consumers.createPull({
      ...body,
      tenantId: request.tenantId!,
    });
    reply.code(HTTP_STATUS.CREATED).send(CreatePullConsumerResponse.mapFromEntity(consumer));
  });

  app.get('/', { schema: consumerSchemas.list, preHandler: [jwtMiddleware] }, async (request, reply) => {
    const query  = ListConsumersQuerySchema.parse(request.query);
    const result = await app.services.consumers.list({
      ...query,
      tenantId: request.tenantId!,
    });
    reply.send({ ...result, items: result.items.map(ConsumerSummaryResponse.mapFromEntity) });
  });

  app.get('/:id', { schema: consumerSchemas.getById, preHandler: [jwtMiddleware] }, async (request, reply) => {
    const { id }   = request.params as { id: string };
    const consumer = await app.services.consumers.getById(id, request.tenantId!);
    reply.send(ConsumerDetailResponse.mapFromEntity(consumer));
  });

  app.put('/:id', { schema: consumerSchemas.update, preHandler: [jwtMiddleware] }, async (request, reply) => {
    const { id }   = request.params as { id: string };
    const body     = UpdateConsumerSchema.parse(request.body);
    const consumer = await app.services.consumers.update(id, {
      ...body,
      tenantId: request.tenantId!,
    });
    reply.send(ConsumerDetailResponse.mapFromEntity(consumer));
  });

  app.delete('/:id', { schema: consumerSchemas.delete, preHandler: [jwtMiddleware] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await app.services.consumers.delete(id, request.tenantId!);
    reply.code(HTTP_STATUS.NO_CONTENT).send();
  });

  app.post('/:id/pause', { schema: consumerSchemas.pause, preHandler: [jwtMiddleware] }, async (request, reply) => {
    const { id }   = request.params as { id: string };
    const consumer = await app.services.consumers.pause(id, request.tenantId!);
    reply.send(ConsumerDetailResponse.mapFromEntity(consumer));
  });

  app.post('/:id/resume', { schema: consumerSchemas.resume, preHandler: [jwtMiddleware] }, async (request, reply) => {
    const { id }   = request.params as { id: string };
    const consumer = await app.services.consumers.resume(id, request.tenantId!);
    reply.send(ConsumerDetailResponse.mapFromEntity(consumer));
  });

  app.get('/:id/health', { schema: consumerSchemas.health, preHandler: [jwtMiddleware] }, async (request, reply) => {
    const { id }      = request.params as { id: string };
    const deliveries  = await app.services.consumers.getHealth(id, request.tenantId!);
    reply.send(ConsumerHealthResponse.mapFromEntity(id, deliveries));
  });
}
