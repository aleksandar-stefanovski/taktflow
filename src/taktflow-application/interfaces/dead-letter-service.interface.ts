import type { DeadLetterEvent }          from '@domain/entities/dead-letter-event.js';
import type { ListDeadLetterEventsQuery } from '../requests/dead-letter/list-dead-letter-events.request.js';
import type { PaginatedResponse }           from '../responses/paginated-response.js';

export interface IDeadLetterService {
  list(query: ListDeadLetterEventsQuery): Promise<PaginatedResponse<DeadLetterEvent>>;
  replay(id: string, tenantId: string): Promise<void>;
}
