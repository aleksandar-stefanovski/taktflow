import type { Topic } from '@domain/entities/topic.js';
import type { ITopicRepository } from '@domain/interfaces/topic-repository.interface.js';

import type { PaginationQuery } from '../requests/pagination.request.js';
import { PaginatedResult } from '../responses/paginated-result.js';

export class ListTopicsHandler {
  constructor(private readonly topics: ITopicRepository) {}

  async handle(query: PaginationQuery & { tenantId: string }): Promise<PaginatedResult<Topic>> {
    const options = { page: query.page, pageSize: query.pageSize };
    const data    = await this.topics.findAll(query.tenantId, options);
    return new PaginatedResult(data, options);
  }
}
