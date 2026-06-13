import type { FastifyInstance, FastifyError } from 'fastify';
import { ZodError } from 'zod';

import { DomainException } from '@taktflow/domain/exceptions/domain-exception.js';
import { ValidationException } from '@taktflow/domain/exceptions/validation-exception.js';

export function registerExceptionHandler(app: FastifyInstance): void {
  app.setErrorHandler((error: FastifyError | Error, request, reply) => {
    if (error instanceof DomainException) {
      request.log.warn({ err: error, code: error.code }, error.message);
      return reply.status(error.statusCode).send({
        success: false,
        error: {
          code:    error.code,
          message: error.message,
          ...(error instanceof ValidationException && { errors: error.errors }),
        },
      });
    }

    if (error instanceof ZodError) {
      request.log.warn({ err: error }, 'Validation failed');
      return reply.status(400).send({
        success: false,
        error: {
          code:    'VALIDATION_ERROR',
          message: 'Validation failed',
          errors:  error.flatten(),
        },
      });
    }

    if ('statusCode' in error && typeof error.statusCode === 'number' && error.statusCode < 500) {
      request.log.warn({ err: error }, error.message);
      return reply.status(error.statusCode).send({
        success: false,
        error: {
          code:    ('code' in error && typeof error.code === 'string') ? error.code : 'REQUEST_ERROR',
          message: error.message,
        },
      });
    }

    request.log.error({ err: error }, error.message);
    return reply.status(500).send({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  });
}
