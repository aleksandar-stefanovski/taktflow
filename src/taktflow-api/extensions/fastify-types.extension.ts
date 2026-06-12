import type { ApplicationDomainServices } from '@api/interfaces/application-domain-services.interface.js';
import type { ApplicationRepositories } from '@api/interfaces/application-repositories.interface.js';

declare module 'fastify' {
  interface FastifyInstance {
    repos:    ApplicationRepositories;
    services: ApplicationDomainServices;
  }

  interface FastifyRequest {
    tenantId?: string;
    userId?:   string;
    role?:     string;
  }
}
