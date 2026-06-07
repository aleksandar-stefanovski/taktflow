import type { FastifyInstance } from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';

import { MAX_PAYLOAD_SIZE_BYTES } from '@types/worker-constants.js';
import { PIPELINE_HEADERS } from '@types/header-constants.js';

import { env } from '../config/env.js';

const RATE_LIMIT_MAX    = 1_000;
const RATE_LIMIT_WINDOW = '1 minute';

export async function securityPlugin(app: FastifyInstance): Promise<void> {
  await app.register(helmet, {
    contentSecurityPolicy:     env.NODE_ENV === 'production',
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy:   env.NODE_ENV === 'production' ? { policy: 'same-origin' } : false,
    crossOriginResourcePolicy: env.NODE_ENV === 'production' ? { policy: 'same-site' } : false,
    dnsPrefetchControl:        { allow: false },
    frameguard:                { action: 'deny' },
    hidePoweredBy:             true,
    hsts:                      env.NODE_ENV === 'production' ? { maxAge: 31_536_000, includeSubDomains: true, preload: true } : false,
    ieNoOpen:                  true,
    noSniff:                   true,
    referrerPolicy:            { policy: ['strict-origin-when-cross-origin'] },
    xssFilter:                 true,
  });

  await app.register(cors, {
    origin:         env.NODE_ENV === 'production' ? env.DASHBOARD_URL : true,
    credentials:    true,
    methods:        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', PIPELINE_HEADERS.API_KEY],
  });

  await app.register(rateLimit, {
    global:     true,
    max:        RATE_LIMIT_MAX,
    timeWindow: RATE_LIMIT_WINDOW,
    // NOTE: per API key when present, per IP for dashboard/unauthenticated requests
    keyGenerator: (request) =>
      (request.headers[PIPELINE_HEADERS.API_KEY] as string | undefined) ?? request.ip,
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
    { bodyLimit: MAX_PAYLOAD_SIZE_BYTES },
    (_req, body, done) => {
      try {
        done(null, JSON.parse(body.toString()));
      } catch {
        done(new Error('Invalid JSON body'), undefined);
      }
    },
  );
}
