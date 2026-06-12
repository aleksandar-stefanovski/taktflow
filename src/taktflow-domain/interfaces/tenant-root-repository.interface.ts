import type { Tenant } from '@domain/entities/tenant.js';
import type { ITenantRootReadRepository } from './readonly/tenant-root-read-repository.interface.js';

export interface ITenantRootRepository extends ITenantRootReadRepository {
  create(tenant: Tenant): Promise<Tenant>;
  update(id: string, updates: Partial<Tenant>): Promise<Tenant>;
}
