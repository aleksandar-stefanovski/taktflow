import type { FastifyInstance } from 'fastify';

import {
  CreateTopicSchema,
  UpdateTopicSchema,
  CreateTopicResponseSchema,
  TopicDetailResponseSchema,
  ListTopicsResponseSchema,
} from '@application/validators/topic-validators.js';
import { PaginationSchema } from '@application/validators/pagination-validators.js';
import { TopicMapper } from '@application/mappers/topic-mapper.js';
import { CreateTopicResponse } from '@application/responses/topics/create-topic.response.js';
import { TopicDetailResponse } from '@application/responses/topics/topic-detail.response.js';

import { jwtMiddleware } from '../../../middleware/jwt-middleware.js';
import { zodToJsonSchema, ErrorResponseSchema } from '../../../schemas/api-schemas.js';

export async function topicsRoutes(app: FastifyInstance): Promise<void> {
  app.post('/', {
    schema: {
      tags:    ['Topics'],
      summary: 'Create a topic',
      body:    zodToJsonSchema(CreateTopicSchema),
      response: {
        201: zodToJsonSchema(CreateTopicResponseSchema),
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        409: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [jwtMiddleware],
  }, async (request, reply) => {
    const body  = CreateTopicSchema.parse(request.body);
    const topic = await app.handlers.createTopic.handle({
      ...body,
      tenantId: request.tenantId!,
    });
    reply.code(201).send(new CreateTopicResponse(topic));
  });

  app.get('/:id', {
    schema: {
      tags:    ['Topics'],
      summary: 'Get topic detail',
      params:  { type: 'object', properties: { id: { type: 'string', format: 'uuid' } }, required: ['id'] },
      response: {
        200: zodToJsonSchema(TopicDetailResponseSchema),
        401: ErrorResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [jwtMiddleware],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const topic   = await app.handlers.getTopic.handle(id, request.tenantId!);
    reply.send(new TopicDetailResponse(topic));
  });

  app.put('/:id', {
    schema: {
      tags:    ['Topics'],
      summary: 'Update topic',
      params:  { type: 'object', properties: { id: { type: 'string', format: 'uuid' } }, required: ['id'] },
      body:    zodToJsonSchema(UpdateTopicSchema),
      response: {
        200: zodToJsonSchema(TopicDetailResponseSchema),
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        404: ErrorResponseSchema,
        409: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [jwtMiddleware],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body    = UpdateTopicSchema.parse(request.body);
    const topic   = await app.handlers.updateTopic.handle(id, {
      ...body,
      tenantId: request.tenantId!,
    });
    reply.send(new TopicDetailResponse(topic));
  });

  app.delete('/:id', {
    schema: {
      tags:    ['Topics'],
      summary: 'Delete topic',
      params:  { type: 'object', properties: { id: { type: 'string', format: 'uuid' } }, required: ['id'] },
      response: {
        204: { type: 'null', description: 'Deleted' },
        401: ErrorResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [jwtMiddleware],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await app.handlers.deleteTopic.handle(id, request.tenantId!);
    reply.code(204).send();
  });

  app.get('/', {
    schema: {
      tags:        ['Topics'],
      summary:     'List topics',
      querystring: zodToJsonSchema(PaginationSchema),
      response: {
        200: zodToJsonSchema(ListTopicsResponseSchema),
        401: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [jwtMiddleware],
  }, async (request, reply) => {
    const query  = PaginationSchema.parse(request.query);
    const result = await app.handlers.listTopics.handle({
      ...query,
      tenantId: request.tenantId!,
    });
    reply.send(TopicMapper.toListResponse(result));
  });
}
