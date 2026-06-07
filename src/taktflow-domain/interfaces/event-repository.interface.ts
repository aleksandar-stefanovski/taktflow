import type { Event } from '../entities/event.js';
import type { ITenantRepository } from './tenant-repository.interface.js';
import type { PaginationOptions } from './pagination-options.interface.js';
import type { PagedData } from './paged-data.interface.js';

export interface IEventRepository extends ITenantRepository<Event> {
  findByTopicId(
    topicId: string,
    tenantId: string,
    options?: PaginationOptions,
  ): Promise<PagedData<Event>>;
  findByIdempotencyKey(key: string, tenantId: string): Promise<Event | null>;
  countThisMonth(tenantId: string): Promise<number>;
}
