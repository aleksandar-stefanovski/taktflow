import type { Consumer } from '../entities/consumer.js';
import type { ITenantRepository } from './tenant-repository.interface.js';
import type { PaginationOptions } from './pagination-options.interface.js';
import type { PagedData } from './paged-data.interface.js';

export interface IConsumerRepository extends ITenantRepository<Consumer> {
  findByTopicId(
    topicId: string,
    tenantId: string,
    options?: PaginationOptions,
  ): Promise<PagedData<Consumer>>;
}
