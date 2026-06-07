import type { FastifyInstance } from 'fastify';

import { ListDeadLetterEventsResponseSchema } from '@application/validators/dead-letter-validators.js';
import { PaginationSchema } from '@application/validators/pagination-validators.js';
import { ListDeadLetterEventsResponse } from '@application/responses/dead-letter/dead-letter-event.response.js';

import { jwtMiddleware } from '../../../middleware/jwt-middleware.js';
import { zodToJsonSchema, ErrorResponseSchema } from '../../../schemas/api-schemas.js';

export async function deadLetterRoutes(app: FastifyInstance): Promise<void> {
  app.get('/', {
    schema: {
      tags:        ['Events'],
      summary:     'List dead letter events',
      querystring: zodToJsonSchema(PaginationSchema),
      response: {
        200: zodToJsonSchema(ListDeadLetterEventsResponseSchema),
        401: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [jwtMiddleware],
  }, async (request, reply) => {
    const query  = PaginationSchema.parse(request.query);
    const result = await app.handlers.listDeadLetterEvents.handle({
      ...query,
      tenantId: request.tenantId!,
    });
    reply.send(new ListDeadLetterEventsResponse(result));
  });

  app.post('/:id/replay', {
    schema: {
      tags:    ['Events'],
      summary: 'Replay a dead letter event',
      params:  { type: 'object', properties: { id: { type: 'string', format: 'uuid' } }, required: ['id'] },
      response: {
        204: { type: 'null', description: 'Replayed' },
        401: ErrorResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [jwtMiddleware],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await app.handlers.replayDeadLetterEvent.handle(id, request.tenantId!);
    reply.code(204).send();
  });
}
