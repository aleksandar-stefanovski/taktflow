import type { ApplicationHandlers } from '../interfaces/application-handlers.interface.js';
import type { ApplicationRepositories } from '../interfaces/application-repositories.interface.js';
import type { ApplicationServices } from '../interfaces/application-services.interface.js';

declare module 'fastify' {
  interface FastifyInstance {
    handlers: ApplicationHandlers;
    repos:    ApplicationRepositories;
    services: ApplicationServices;
  }

  interface FastifyRequest {
    tenantId?: string;
    userId?:   string;
  }
}
