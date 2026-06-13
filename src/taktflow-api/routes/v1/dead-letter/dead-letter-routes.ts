import type { FastifyInstance } from 'fastify';

import { PaginationSchema }         from '@api/swagger/pagination-schema.js';
import { DeadLetterEventResponse }  from '@application/responses/dead-letter/dead-letter-event.response.js';

import { jwtMiddleware }    from '@api/middleware/jwt-middleware.js';
import { deadLetterSchemas } from './dead-letter.schemas.js';
import { HTTP_STATUS }       from '@api/constants/http.constants.js';

export async function deadLetterRoutes(app: FastifyInstance): Promise<void> {
  app.get('/', { schema: deadLetterSchemas.list, preHandler: [jwtMiddleware] }, async (request, reply) => {
    const query  = PaginationSchema.parse(request.query);
    const result = await app.services.deadLetter.list({
      ...query,
      tenantId: request.tenantId!,
    });
    reply.send({ ...result, items: result.items.map(DeadLetterEventResponse.mapFromEntity) });
  });

  app.post('/:id/replay', { schema: deadLetterSchemas.replay, preHandler: [jwtMiddleware] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await app.services.deadLetter.replay(id, request.tenantId!);
    reply.code(HTTP_STATUS.NO_CONTENT).send();
  });
}
