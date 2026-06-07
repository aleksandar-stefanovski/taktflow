import { z } from 'zod';
import type { FastifyInstance } from 'fastify';

import {
  CreatePushConsumerSchema,
  CreatePullConsumerSchema,
  UpdateConsumerSchema,
  CreatePushConsumerResponseSchema,
  CreatePullConsumerResponseSchema,
  ConsumerDetailResponseSchema,
  ListConsumersResponseSchema,
  ConsumerHealthResponseSchema,
} from '@application/validators/consumer-validators.js';
import { PaginationSchema } from '@application/validators/pagination-validators.js';
import { ConsumerMapper } from '@application/mappers/consumer-mapper.js';
import { CreatePushConsumerResponse } from '@application/responses/consumers/create-push-consumer.response.js';
import { CreatePullConsumerResponse } from '@application/responses/consumers/create-pull-consumer.response.js';
import { ConsumerDetailResponse } from '@application/responses/consumers/consumer-detail.response.js';
import { ConsumerHealthResponse } from '@application/responses/consumers/consumer-health.response.js';

import { jwtMiddleware } from '../../../middleware/jwt-middleware.js';
import { zodToJsonSchema, ErrorResponseSchema } from '../../../schemas/api-schemas.js';

const ListConsumersQuerySchema = PaginationSchema.extend({
  topicId: z.string().uuid().optional(),
});

const idParams = { type: 'object', properties: { id: { type: 'string', format: 'uuid' } }, required: ['id'] } as const;

export async function consumersRoutes(app: FastifyInstance): Promise<void> {
  app.post('/push', {
    schema: {
      tags:    ['Consumers'],
      summary: 'Register a push consumer',
      body:    zodToJsonSchema(CreatePushConsumerSchema),
      response: {
        201: zodToJsonSchema(CreatePushConsumerResponseSchema),
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [jwtMiddleware],
  }, async (request, reply) => {
    const body     = CreatePushConsumerSchema.parse(request.body);
    const consumer = await app.handlers.createPushConsumer.handle({
      ...body,
      tenantId: request.tenantId!,
    });
    reply.code(201).send(new CreatePushConsumerResponse(consumer));
  });

  app.post('/pull', {
    schema: {
      tags:    ['Consumers'],
      summary: 'Register a pull consumer',
      body:    zodToJsonSchema(CreatePullConsumerSchema),
      response: {
        201: zodToJsonSchema(CreatePullConsumerResponseSchema),
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [jwtMiddleware],
  }, async (request, reply) => {
    const body     = CreatePullConsumerSchema.parse(request.body);
    const consumer = await app.handlers.createPullConsumer.handle({
      ...body,
      tenantId: request.tenantId!,
    });
    reply.code(201).send(new CreatePullConsumerResponse(consumer));
  });

  app.get('/', {
    schema: {
      tags:        ['Consumers'],
      summary:     'List consumers',
      querystring: zodToJsonSchema(ListConsumersQuerySchema),
      response: {
        200: zodToJsonSchema(ListConsumersResponseSchema),
        401: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [jwtMiddleware],
  }, async (request, reply) => {
    const query  = ListConsumersQuerySchema.parse(request.query);
    const result = await app.handlers.listConsumers.handle({
      ...query,
      tenantId: request.tenantId!,
    });
    reply.send(ConsumerMapper.toListResponse(result));
  });

  app.get('/:id', {
    schema: {
      tags:    ['Consumers'],
      summary: 'Get consumer detail',
      params:  idParams,
      response: {
        200: zodToJsonSchema(ConsumerDetailResponseSchema),
        401: ErrorResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [jwtMiddleware],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const consumer = await app.handlers.getConsumer.handle(id, request.tenantId!);
    reply.send(new ConsumerDetailResponse(consumer));
  });

  app.put('/:id', {
    schema: {
      tags:    ['Consumers'],
      summary: 'Update consumer',
      params:  idParams,
      body:    zodToJsonSchema(UpdateConsumerSchema),
      response: {
        200: zodToJsonSchema(ConsumerDetailResponseSchema),
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [jwtMiddleware],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body    = UpdateConsumerSchema.parse(request.body);
    const consumer = await app.handlers.updateConsumer.handle(id, {
      ...body,
      tenantId: request.tenantId!,
    });
    reply.send(new ConsumerDetailResponse(consumer));
  });

  app.delete('/:id', {
    schema: {
      tags:    ['Consumers'],
      summary: 'Delete consumer',
      params:  idParams,
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
    await app.handlers.deleteConsumer.handle(id, request.tenantId!);
    reply.code(204).send();
  });

  app.post('/:id/pause', {
    schema: {
      tags:    ['Consumers'],
      summary: 'Pause consumer',
      params:  idParams,
      response: {
        200: zodToJsonSchema(ConsumerDetailResponseSchema),
        401: ErrorResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [jwtMiddleware],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const consumer = await app.handlers.pauseConsumer.handle(id, request.tenantId!);
    reply.send(new ConsumerDetailResponse(consumer));
  });

  app.post('/:id/resume', {
    schema: {
      tags:    ['Consumers'],
      summary: 'Resume consumer',
      params:  idParams,
      response: {
        200: zodToJsonSchema(ConsumerDetailResponseSchema),
        401: ErrorResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [jwtMiddleware],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const consumer = await app.handlers.resumeConsumer.handle(id, request.tenantId!);
    reply.send(new ConsumerDetailResponse(consumer));
  });

  app.get('/:id/health', {
    schema: {
      tags:    ['Consumers'],
      summary: 'Get consumer delivery health',
      params:  idParams,
      response: {
        200: zodToJsonSchema(ConsumerHealthResponseSchema),
        401: ErrorResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [jwtMiddleware],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const health = await app.handlers.getConsumerHealth.handle(id, request.tenantId!);
    reply.send(new ConsumerHealthResponse(health));
  });
}
