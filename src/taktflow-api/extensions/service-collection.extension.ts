import type { FastifyInstance } from 'fastify';

import type { DrizzleDb } from '@persistence/database.js';
import { AsyncLocalStorageTenantProvider } from '@infrastructure/context/async-local-storage-tenant-provider.js';
import { tenantContextStore }              from '@infrastructure/context/tenant-context-store.js';

import { buildRepositories }  from './repositories.extension.js';
import { buildUsageService }  from './usage.extension.js';
import { buildDomainServices } from './services.extension.js';

export async function registerApiDependencies(
  app: FastifyInstance,
  db: DrizzleDb,
): Promise<void> {
  const tenantProvider = new AsyncLocalStorageTenantProvider();

  app.addHook('onRequest', (_request, _reply, done) => {
    tenantContextStore.run({ tenantId: null }, done);
  });

  const repos    = buildRepositories(db, tenantProvider);
  const usage    = buildUsageService(repos.events, repos.tenants);
  const services = buildDomainServices(db, repos, usage);

  app.decorate('repos',    repos);
  app.decorate('services', services);
}
