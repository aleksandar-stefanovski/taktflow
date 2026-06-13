import type { RegisterTenantSchema } from '@application/validators/tenant-validators.js';
import type { z } from 'zod';

export type RegisterTenantRequest = z.infer<typeof RegisterTenantSchema>;
