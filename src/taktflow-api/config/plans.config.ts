import { z } from 'zod';

const PlansSchema = z.object({
  PLAN_STARTER_EVENTS_PER_MONTH:    z.coerce.number().int().positive(),
  PLAN_GROWTH_EVENTS_PER_MONTH:     z.coerce.number().int().positive(),
  PLAN_BUSINESS_EVENTS_PER_MONTH:   z.coerce.number().int().positive(),
  PLAN_ENTERPRISE_EVENTS_PER_MONTH: z.coerce.number().int().positive(),
  RETRY_BASE_DELAY_MS:              z.coerce.number().int().positive(),
  RETRY_MAX_ATTEMPTS:               z.coerce.number().int().positive(),
});

export const plansConfig = PlansSchema.parse(process.env);
