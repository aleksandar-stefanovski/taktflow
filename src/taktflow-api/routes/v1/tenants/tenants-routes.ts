import type { FastifyInstance } from 'fastify';

import {
  UpdateTenantSchema,
  TenantResponseSchema,
  UsageResponseSchema,
} from '@application/validators/tenant-validators.js';
import { TenantResponse } from '@application/responses/tenants/tenant.response.js';
import { UsageResponse } from '@application/responses/tenants/usage.response.js';

import { jwtMiddleware } from '@api/middleware/jwt-middleware.js';
import { zodToJsonSchema, ErrorResponseSchema } from '@api/schemas/api-schemas.js';

export async function tenantsRoutes(app: FastifyInstance): Promise<void> {
  app.get('/me', {
    schema: {
      tags:    ['Tenants'],
      summary: 'Get current tenant info and plan',
      response: {
        200: zodToJsonSchema(TenantResponseSchema),
        401: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [jwtMiddleware],
  }, async (request, reply) => {
    const tenant = await app.services.tenants.getById(request.tenantId!);
    reply.send(TenantResponse.mapFromEntity(tenant));
  });

  app.put('/me', {
    schema: {
      tags:    ['Tenants'],
      summary: 'Update tenant settings',
      body:    zodToJsonSchema(UpdateTenantSchema),
      response: {
        200: zodToJsonSchema(TenantResponseSchema),
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [jwtMiddleware],
  }, async (request, reply) => {
    const body   = UpdateTenantSchema.parse(request.body);
    const tenant = await app.services.tenants.update({
      tenantId: request.tenantId!,
      name:     body.name,
    });
    reply.send(TenantResponse.mapFromEntity(tenant));
  });

  app.get('/me/usage', {
    schema: {
      tags:    ['Tenants'],
      summary: 'Get current month event usage vs plan limit',
      response: {
        200: zodToJsonSchema(UsageResponseSchema),
        401: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [jwtMiddleware],
  }, async (request, reply) => {
    const usage = await app.services.tenants.getUsage(request.tenantId!);
    reply.send(UsageResponse.mapFromEntity(usage));
  });
}
