import type { FastifyInstance } from 'fastify';

import {
  CreateTopicSchema,
  UpdateTopicSchema,
} from '@taktflow/application/validators/topic-validators.js';
import { PaginationSchema }     from '@api/swagger/pagination-schema.js';
import { CreateTopicResponse }  from '@taktflow/application/responses/topics/create-topic.response.js';
import { TopicDetailResponse }  from '@taktflow/application/responses/topics/topic-detail.response.js';
import { TopicSummaryResponse } from '@taktflow/application/responses/topics/topic-summary.response.js';

import { jwtMiddleware } from '@api/middleware/jwt-middleware.js';
import { topicSchemas }  from './topics.schemas.js';
import { HTTP_STATUS }   from '@api/constants/http.constants.js';

export async function topicsRoutes(app: FastifyInstance): Promise<void> {
  app.post('/', { schema: topicSchemas.create, preHandler: [jwtMiddleware] }, async (request, reply) => {
    const body  = CreateTopicSchema.parse(request.body);
    const topic = await app.services.topics.create({
      ...body,
      tenantId: request.tenantId!,
    });
    reply.code(HTTP_STATUS.CREATED).send(CreateTopicResponse.mapFromEntity(topic));
  });

  app.get('/:id', { schema: topicSchemas.getById, preHandler: [jwtMiddleware] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const topic  = await app.services.topics.getById(id, request.tenantId!);
    reply.send(TopicDetailResponse.mapFromEntity(topic));
  });

  app.put('/:id', { schema: topicSchemas.update, preHandler: [jwtMiddleware] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body   = UpdateTopicSchema.parse(request.body);
    const topic  = await app.services.topics.update(id, {
      ...body,
      tenantId: request.tenantId!,
    });
    reply.send(TopicDetailResponse.mapFromEntity(topic));
  });

  app.delete('/:id', { schema: topicSchemas.delete, preHandler: [jwtMiddleware] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await app.services.topics.delete(id, request.tenantId!);
    reply.code(HTTP_STATUS.NO_CONTENT).send();
  });

  app.get('/', { schema: topicSchemas.list, preHandler: [jwtMiddleware] }, async (request, reply) => {
    const query  = PaginationSchema.parse(request.query);
    const result = await app.services.topics.list({
      ...query,
      tenantId: request.tenantId!,
    });
    reply.send({ ...result, items: result.items.map(TopicSummaryResponse.mapFromEntity) });
  });
}
