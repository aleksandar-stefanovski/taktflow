import type { FastifyInstance } from 'fastify';

import { eventsRoutes }     from '@api/routes/v1/events/events-routes.js';
import { topicsRoutes }     from '@api/routes/v1/topics/topics-routes.js';
import { consumersRoutes }  from '@api/routes/v1/consumers/consumers-routes.js';
import { schedulesRoutes }  from '@api/routes/v1/schedules/schedules-routes.js';
import { apiKeysRoutes }    from '@api/routes/v1/api-keys/api-keys-routes.js';
import { authRoutes }       from '@api/routes/v1/auth/auth-routes.js';
import { dashboardRoutes }  from '@api/routes/v1/dashboard/dashboard-routes.js';
import { usersRoutes }      from '@api/routes/v1/users/users-routes.js';
import { tenantsRoutes }    from '@api/routes/v1/tenants/tenants-routes.js';
import { deadLetterRoutes } from '@api/routes/v1/dead-letter/dead-letter-routes.js';

export async function registerRoutes(app: FastifyInstance): Promise<void> {
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
}
