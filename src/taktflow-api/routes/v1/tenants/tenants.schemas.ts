import { z } from 'zod';

import { UpdateTenantSchema, ReactivateTenantSchema } from '@application/validators/tenant-validators.js';
import { zodToJsonSchema, ErrorResponseSchema } from '@api/swagger/api-schemas.js';

const TenantSchema = z.object({
  id:        z.string().uuid(),
  name:      z.string(),
  plan:      z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const UsageSchema = z.object({
  count:      z.number().int(),
  limit:      z.number().int(),
  percentage: z.number(),
});

export const tenantSchemas = {
  getMe: {
    tags:    ['Tenants'],
    summary: 'Get current tenant info and plan',
    response: {
      200: zodToJsonSchema(TenantSchema),
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
  updateMe: {
    tags:    ['Tenants'],
    summary: 'Update tenant settings',
    body:    zodToJsonSchema(UpdateTenantSchema),
    response: {
      200: zodToJsonSchema(TenantSchema),
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
  getUsage: {
    tags:    ['Tenants'],
    summary: 'Get current month event usage vs plan limit',
    response: {
      200: zodToJsonSchema(UsageSchema),
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
  deleteMe: {
    tags:    ['Tenants'],
    summary: 'Request deletion of the current tenant (30-day grace period)',
    response: {
      204: { type: 'null', description: 'Deletion scheduled' },
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
  reactivate: {
    tags:    ['Tenants'],
    summary: 'Reactivate a tenant within the grace period',
    body:    zodToJsonSchema(ReactivateTenantSchema),
    response: {
      200: zodToJsonSchema(z.object({
        accessToken:  z.string(),
        refreshToken: z.string(),
        user: z.object({
          id:        z.string().uuid(),
          email:     z.string().email(),
          firstName: z.string(),
          lastName:  z.string(),
          role:      z.string(),
        }),
      })),
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      410: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
};
