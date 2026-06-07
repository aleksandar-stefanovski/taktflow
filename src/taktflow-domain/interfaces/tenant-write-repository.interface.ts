import type { BaseEntity } from '../entities/base-entity.js';
import type { HasTenant } from './has-tenant.interface.js';

export interface ITenantWriteRepository<T extends BaseEntity & HasTenant> {
  create(entity: T): Promise<T>;
  update(id: string, tenantId: string, updates: Partial<T>): Promise<T>;
  delete(id: string, tenantId: string): Promise<void>;
}
