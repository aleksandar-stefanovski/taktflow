import type { Event } from '@domain/entities/event.js';
import type { IEventRepository } from '@domain/interfaces/event-repository.interface.js';

import type { ListEventsQuery } from '../requests/events/list-events.request.js';
import { PaginatedResult } from '../responses/paginated-result.js';

export class ListEventsHandler {
  constructor(private readonly events: IEventRepository) {}

  async handle(query: ListEventsQuery & { tenantId: string }): Promise<PaginatedResult<Event>> {
    const options = { page: query.page, pageSize: query.pageSize };

    const data = query.topicId
      ? await this.events.findByTopicId(query.topicId, query.tenantId, options)
      : await this.events.findAll(query.tenantId, options);

    return new PaginatedResult(data, options);
  }
}
