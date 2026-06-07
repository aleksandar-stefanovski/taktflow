import type { Consumer } from '@domain/entities/consumer.js';
import type { IConsumerRepository } from '@domain/interfaces/consumer-repository.interface.js';

import type { ListConsumersQuery } from '../requests/consumers/list-consumers.request.js';
import { PaginatedResult } from '../responses/paginated-result.js';

export class ListConsumersHandler {
  constructor(private readonly consumers: IConsumerRepository) {}

  async handle(query: ListConsumersQuery & { tenantId: string }): Promise<PaginatedResult<Consumer>> {
    const options = { page: query.page, pageSize: query.pageSize };

    const data = query.topicId
      ? await this.consumers.findByTopicId(query.topicId, query.tenantId, options)
      : await this.consumers.findAll(query.tenantId, options);

    return new PaginatedResult(data, options);
  }
}
