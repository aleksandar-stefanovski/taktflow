import type { DeadLetterEvent } from '@domain/entities/dead-letter-event.js';
import type { IDeadLetterEventRepository } from '@domain/interfaces/dead-letter-event-repository.interface.js';

import type { ListDeadLetterEventsQuery } from '../requests/dead-letter/list-dead-letter-events.request.js';
import { PaginatedResult } from '../responses/paginated-result.js';

export class ListDeadLetterEventsHandler {
  constructor(private readonly dlq: IDeadLetterEventRepository) {}

  async handle(query: ListDeadLetterEventsQuery): Promise<PaginatedResult<DeadLetterEvent>> {
    const options = { page: query.page, pageSize: query.pageSize };
    const data    = await this.dlq.findAll(query.tenantId, options);
    return new PaginatedResult(data, options);
  }
}
