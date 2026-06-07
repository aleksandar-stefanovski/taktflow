import Fastify, { type FastifyInstance } from 'fastify';

import type { DrizzleDb } from '@persistence/database.js';

import { serverConfig } from '@api/config/server.config.js';
import { securityPlugin } from '@api/plugins/security-plugin.js';
import { registerExceptionHandler } from '@api/middleware/exception-handler.js';
import { registerSwagger } from '@api/extensions/swagger.extension.js';
import { registerApiDependencies } from '@api/extensions/service-collection.extension.js';
import { registerRoutes } from '@api/extensions/routes.extension.js';

export async function buildApp(db: DrizzleDb): Promise<FastifyInstance> {
  const app = Fastify({ logger: { level: serverConfig.LOG_LEVEL } });

  await app.register(securityPlugin);
  await registerSwagger(app);
  await registerApiDependencies(app, db);
  registerExceptionHandler(app);
  await registerRoutes(app);

  return app;
}
