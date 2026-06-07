import Fastify, { type FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

import type { DrizzleDb } from '@persistence/database.js';

import { PIPELINE_HEADERS } from '@types/header-constants.js';

import { env } from './config/env.js';
import { securityPlugin } from './plugins/security-plugin.js';
import { registerApiDependencies } from './extensions/api-extensions.extension.js';
import { registerExceptionHandler } from './middleware/exception-handler.js';

import { eventsRoutes } from './routes/v1/events/events-routes.js';
import { topicsRoutes } from './routes/v1/topics/topics-routes.js';
import { consumersRoutes } from './routes/v1/consumers/consumers-routes.js';
import { schedulesRoutes } from './routes/v1/schedules/schedules-routes.js';
import { apiKeysRoutes } from './routes/v1/api-keys/api-keys-routes.js';
import { authRoutes } from './routes/v1/auth/auth-routes.js';
import { dashboardRoutes } from './routes/v1/dashboard/dashboard-routes.js';
import { usersRoutes } from './routes/v1/users/users-routes.js';
import { tenantsRoutes } from './routes/v1/tenants/tenants-routes.js';
import { deadLetterRoutes } from './routes/v1/dead-letter/dead-letter-routes.js';

export async function buildApp(db: DrizzleDb): Promise<FastifyInstance> {
  const app = Fastify({ logger: { level: env.LOG_LEVEL } });

  await app.register(securityPlugin);

  await app.register(swagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title:       'Taktflow API',
        description: 'Event pipeline platform — produce events, manage topics, consumers, and schedules.',
        version:     '1.0.0',
        contact: { name: 'Taktflow Support' },
      },
      servers: [
        {
          url:         env.NODE_ENV === 'production' ? env.DASHBOARD_URL : '/',
          description: env.NODE_ENV === 'production' ? 'Production' : 'Development',
        },
      ],
      tags: [
        { name: 'Events',    description: 'Produce and retrieve events' },
        { name: 'Topics',    description: 'Manage event topics' },
        { name: 'Consumers', description: 'Manage push and pull consumers' },
        { name: 'Schedules', description: 'Manage cron-based scheduled events' },
        { name: 'API Keys',  description: 'Manage API keys for SDK access' },
        { name: 'Auth',      description: 'Authentication and token management' },
        { name: 'Users',     description: 'User profile management' },
        { name: 'Tenants',   description: 'Tenant settings and usage' },
        { name: 'Dashboard', description: 'Aggregated metrics' },
        { name: 'System',    description: 'Service health and diagnostics' },
      ],
      security: [{ bearerAuth: [] }],
      components: {
        securitySchemes: {
          apiKey: {
            type: 'apiKey',
            in:   'header',
            name: PIPELINE_HEADERS.API_KEY,
            description: 'SDK API key — used for event production (sk_live_...)',
          },
          bearerAuth: {
            type:         'http',
            scheme:       'bearer',
            bearerFormat: 'JWT',
            description:  'Dashboard JWT — obtained from /v1/auth/login',
          },
        },
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion:    'list',
      deepLinking:     true,
      tryItOutEnabled: true,
    },
    staticCSP: env.NODE_ENV === 'production',
  });

  await registerApiDependencies(app, db);
  registerExceptionHandler(app);

  await app.register(async (v1) => {
    await v1.register(eventsRoutes,    { prefix: '/events' });
    await v1.register(topicsRoutes,    { prefix: '/topics' });
    await v1.register(consumersRoutes, { prefix: '/consumers' });
    await v1.register(schedulesRoutes, { prefix: '/schedules' });
    await v1.register(apiKeysRoutes,   { prefix: '/api-keys' });
    await v1.register(authRoutes,       { prefix: '/auth' });
    await v1.register(dashboardRoutes,  { prefix: '/dashboard' });
    await v1.register(usersRoutes,      { prefix: '/users' });
    await v1.register(tenantsRoutes,    { prefix: '/tenants' });
    await v1.register(deadLetterRoutes, { prefix: '/dead-letter' });
  }, { prefix: '/v1' });

  app.get('/health', {
    schema: { tags: ['System'], summary: 'Health check', security: [] },
  }, async () => ({
    status:    'ok',
    timestamp: new Date().toISOString(),
    version:   process.env['npm_package_version'],
  }));

  return app;
}
