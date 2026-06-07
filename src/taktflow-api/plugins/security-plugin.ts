import type { FastifyInstance } from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';

import { serverConfig } from '@api/config/server.config.js';
import { HTTP_CONSTANTS } from '@api/constants/http.constants.js';

export async function securityPlugin(app: FastifyInstance): Promise<void> {
  await app.register(helmet, {
    contentSecurityPolicy:     serverConfig.NODE_ENV === 'production',
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy:   serverConfig.NODE_ENV === 'production' ? { policy: 'same-origin' } : false,
    crossOriginResourcePolicy: serverConfig.NODE_ENV === 'production' ? { policy: 'same-site' } : false,
    dnsPrefetchControl:        { allow: false },
    frameguard:                { action: 'deny' },
    hidePoweredBy:             true,
    hsts:                      serverConfig.NODE_ENV === 'production' ? { maxAge: 31_536_000, includeSubDomains: true, preload: true } : false,
    ieNoOpen:                  true,
    noSniff:                   true,
    referrerPolicy:            { policy: ['strict-origin-when-cross-origin'] },
    xssFilter:                 true,
  });

  await app.register(cors, {
    origin:         serverConfig.NODE_ENV === 'production' ? serverConfig.DASHBOARD_URL : true,
    credentials:    true,
    methods:        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', HTTP_CONSTANTS.API_KEY_HEADER],
  });

  await app.register(rateLimit, {
    global:     true,
    max:        serverConfig.RATE_LIMIT_MAX,
    timeWindow: serverConfig.RATE_LIMIT_WINDOW,
    // NOTE: per API key when present, per IP for dashboard/unauthenticated requests
    keyGenerator: (request) =>
      (request.headers[HTTP_CONSTANTS.API_KEY_HEADER] as string | undefined) ?? request.ip,
    errorResponseBuilder: (_request, context) => ({
      success: false,
      error: {
        code:      'RATE_LIMITED',
        message:   `Rate limit exceeded. Try again in ${context.ttl}ms`,
        limit:     context.max,
        remaining: 0,
      },
    }),
  });

  app.addContentTypeParser(
    'application/json',
    { bodyLimit: serverConfig.MAX_PAYLOAD_SIZE_BYTES },
    (_req, body, done) => {
      try {
        done(null, JSON.parse(body.toString()));
      } catch {
        done(new Error('Invalid JSON body'), undefined);
      }
    },
  );
}
