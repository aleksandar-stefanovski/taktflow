import type { BaseEntity } from '../entities/base-entity.js';
import type { HasTenant } from './has-tenant.interface.js';
import type { ITenantReadRepository } from './tenant-read-repository.interface.js';
import type { ITenantWriteRepository } from './tenant-write-repository.interface.js';

export interface ITenantRepository<T extends BaseEntity & HasTenant>
  extends ITenantReadRepository<T>,
    ITenantWriteRepository<T> {}
