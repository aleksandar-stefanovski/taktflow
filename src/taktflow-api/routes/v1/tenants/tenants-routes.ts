import type { FastifyInstance } from 'fastify';

import { UpdateTenantSchema, ReactivateTenantSchema } from '@application/validators/tenant-validators.js';
import { TenantResponse }                             from '@application/responses/tenants/tenant.response.js';
import { UsageResponse }                              from '@application/responses/tenants/usage.response.js';

import { jwtMiddleware } from '@api/middleware/jwt-middleware.js';
import { tenantSchemas } from './tenants.schemas.js';
import { HTTP_STATUS }   from '@api/constants/http.constants.js';

export async function tenantsRoutes(app: FastifyInstance): Promise<void> {
  app.get('/me', { schema: tenantSchemas.getMe, preHandler: [jwtMiddleware] }, async (request, reply) => {
    const tenant = await app.services.tenants.getById(request.tenantId!);
    reply.send(TenantResponse.mapFromEntity(tenant));
  });

  app.put('/me', { schema: tenantSchemas.updateMe, preHandler: [jwtMiddleware] }, async (request, reply) => {
    const body   = UpdateTenantSchema.parse(request.body);
    const tenant = await app.services.tenants.update({
      tenantId: request.tenantId!,
      name:     body.name,
    });
    reply.send(TenantResponse.mapFromEntity(tenant));
  });

  app.get('/me/usage', { schema: tenantSchemas.getUsage, preHandler: [jwtMiddleware] }, async (request, reply) => {
    const usage = await app.services.tenants.getUsage(request.tenantId!);
    reply.send(UsageResponse.mapFromEntity(usage));
  });

  app.delete('/me', { schema: tenantSchemas.deleteMe, preHandler: [jwtMiddleware] }, async (request, reply) => {
    await app.services.tenants.delete(request.tenantId!);
    reply.code(HTTP_STATUS.NO_CONTENT).send();
  });

  app.post('/reactivate', { schema: tenantSchemas.reactivate }, async (request, reply) => {
    const body   = ReactivateTenantSchema.parse(request.body);
    const result = await app.services.auth.reactivateTenant(body);
    reply.send(result);
  });
}
