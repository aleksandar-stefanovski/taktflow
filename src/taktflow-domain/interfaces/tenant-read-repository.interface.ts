import type { BaseEntity } from '../entities/base-entity.js';
import type { HasTenant } from './has-tenant.interface.js';
import type { PaginationOptions } from './pagination-options.interface.js';
import type { PagedData } from './paged-data.interface.js';

export interface ITenantReadRepository<T extends BaseEntity & HasTenant> {
  findById(id: string, tenantId: string): Promise<T | null>;
  findAll(tenantId: string, options?: PaginationOptions): Promise<PagedData<T>>;
  exists(id: string, tenantId: string): Promise<boolean>;
}
