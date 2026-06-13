import type { Tenant } from '@domain/entities/tenant.js';
import type { ITenantRootReadRepository } from './readonly/tenant-root-read-repository.interface.js';

export interface ITenantRootRepository extends ITenantRootReadRepository {
  create(tenant: Tenant): Promise<Tenant>;
  update(id: string, updates: Partial<Tenant>): Promise<Tenant>;
  softDelete(id: string): Promise<void>;
  reactivate(id: string): Promise<Tenant>;
  findByIdIncludingDeleted(id: string): Promise<Tenant | null>;
}
