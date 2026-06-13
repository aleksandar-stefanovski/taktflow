import type { Event }                from '@taktflow/domain/entities/event.js';
import type { ProduceEventRequest }  from '../requests/events/produce-event.request.js';
import type { ListEventsQuery }      from '../requests/events/list-events.request.js';
import type { PaginatedResponse }      from '../responses/paginated-response.js';

export interface IEventService {
  produce(request: ProduceEventRequest & { tenantId: string }): Promise<Event>;
  getById(eventId: string, tenantId: string): Promise<Event>;
  list(query: ListEventsQuery & { tenantId: string }): Promise<PaginatedResponse<Event>>;
}
