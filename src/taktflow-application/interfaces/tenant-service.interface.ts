import type { Tenant } from '@domain/entities/tenant.js';

export interface ITenantService {
  getById(tenantId: string): Promise<Tenant>;
  update(command: { tenantId: string; name?: string }): Promise<Tenant>;
  delete(tenantId: string): Promise<void>;
  getUsage(tenantId: string): Promise<{ count: number; limit: number }>;
}
