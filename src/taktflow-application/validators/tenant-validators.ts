import { z } from 'zod';

export const RegisterTenantSchema = z.object({
  name:      z.string().min(1).max(255),
  plan:      z.enum(['starter', 'growth', 'business', 'enterprise']).optional(),
  email:     z.string().email(),
  password:  z.string().min(8),
  firstName: z.string().min(1).max(100),
  lastName:  z.string().min(1).max(100),
});

export const UpdateTenantSchema = z.object({
  name: z.string().min(1).max(255).optional(),
});

export const ConsumeEventsQuerySchema = z.object({
  consumerId: z.string().uuid(),
  limit:      z.coerce.number().int().min(1).max(100).default(10),
});

export const TenantResponseSchema = z.object({
  id:        z.string().uuid(),
  name:      z.string(),
  plan:      z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const UsageResponseSchema = z.object({
  count:      z.number().int(),
  limit:      z.number().int(),
  percentage: z.number(),
});
