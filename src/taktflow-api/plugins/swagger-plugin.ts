import type { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

import { PIPELINE_HEADERS } from '@types/header-constants.js';

import { env } from '../config/env.js';

export async function swaggerPlugin(app: FastifyInstance): Promise<void> {
  await app.register(swagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title:       'Taktflow API',
        description: 'Event pipeline platform — produce events, manage topics, consumers, and schedules.',
        version:     '1.0.0',
        contact: {
          name: 'Taktflow Support',
        },
      },
      servers: [
        {
          url:         env.NODE_ENV === 'production' ? env.DASHBOARD_URL : `http://localhost:${env.PORT}`,
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
      ],
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
      docExpansion: 'list',
      deepLinking:  true,
      tryItOutEnabled: true,
    },
    staticCSP: true,
  });
}
