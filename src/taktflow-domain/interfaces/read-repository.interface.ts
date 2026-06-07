import type { BaseEntity } from '../entities/base-entity.js';
import type { PaginationOptions } from './pagination-options.interface.js';
import type { PagedData } from './paged-data.interface.js';

export interface IReadRepository<T extends BaseEntity> {
  findById(id: string): Promise<T | null>;
  findAll(options?: PaginationOptions): Promise<PagedData<T>>;
  exists(id: string): Promise<boolean>;
}
