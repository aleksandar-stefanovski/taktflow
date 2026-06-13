import type { SwaggerOptions } from '@fastify/swagger';
import type { FastifySwaggerUiOptions } from '@fastify/swagger-ui';

import { serverConfig } from '@api/config/server.config.js';
import { HTTP_CONSTANTS } from '@api/constants/http.constants.js';

export const swaggerOptions: SwaggerOptions = {
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
        url:         serverConfig.STRICT_SECURITY ? serverConfig.DASHBOARD_URL : '/',
        description: serverConfig.STRICT_SECURITY ? 'Production' : 'Development',
      },
    ],
    tags: [
      { name: 'Events',    description: 'Produce and retrieve events' },
      { name: 'Topics',    description: 'Manage event topics' },
      { name: 'Consumers', description: 'Manage push and pull consumers' },
      { name: 'Schedules', description: 'Manage cron-based scheduled events' },
      { name: 'API Keys',  description: 'Manage API keys for event ingestion' },
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
          name: HTTP_CONSTANTS.API_KEY_HEADER,
          description: 'API key — used for event ingestion (sk_live_...)',
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
};

export const swaggerUiOptions: FastifySwaggerUiOptions | null = serverConfig.ENABLE_SWAGGER_UI
  ? {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion:    'list',
        deepLinking:     true,
        tryItOutEnabled: true,
      },
      staticCSP: serverConfig.STRICT_SECURITY,
    }
  : null;
