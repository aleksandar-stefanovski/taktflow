import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import type { FastifyInstance } from 'fastify';

import { swaggerOptions, swaggerUiOptions } from '@api/swagger/swagger.config.js';

export async function registerSwagger(app: FastifyInstance): Promise<void> {
  await app.register(swagger, swaggerOptions);
  if (swaggerUiOptions) {
    await app.register(swaggerUi, swaggerUiOptions);
  }
}
