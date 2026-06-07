import type { Tenant } from '../entities/tenant.js';
import type { PaginationOptions } from './pagination-options.interface.js';
import type { PagedData } from './paged-data.interface.js';

export interface ITenantRootRepository {
  findById(id: string): Promise<Tenant | null>;
  findAll(options?: PaginationOptions): Promise<PagedData<Tenant>>;
  create(tenant: Tenant): Promise<Tenant>;
  update(id: string, updates: Partial<Tenant>): Promise<Tenant>;
}
