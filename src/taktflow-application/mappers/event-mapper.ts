import type { Event } from '@domain/entities/event.js';
import type { PaginatedResult } from '@application/responses/paginated-result.js';

import { GetEventDetailResponse } from '../responses/events/get-event-detail.response.js';
import { EventSummaryResponse, ListEventsResponse } from '../responses/events/list-events.response.js';
import { ProduceEventResponse } from '../responses/events/produce-event.response.js';

export class EventMapper {
  static toProduceResponse(event: Event): ProduceEventResponse {
    return new ProduceEventResponse(event);
  }

  static toDetailResponse(event: Event): GetEventDetailResponse {
    return new GetEventDetailResponse(event);
  }

  static toSummaryResponse(event: Event): EventSummaryResponse {
    return new EventSummaryResponse(event);
  }

  static toListResponse(result: PaginatedResult<Event>): ListEventsResponse {
    return new ListEventsResponse(result);
  }
}
