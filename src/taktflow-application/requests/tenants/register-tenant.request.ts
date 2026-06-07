import type { RegisterTenantSchema } from '../../validators/tenant-validators.js';
import type { z } from 'zod';

export type RegisterTenantRequest = z.infer<typeof RegisterTenantSchema>;
