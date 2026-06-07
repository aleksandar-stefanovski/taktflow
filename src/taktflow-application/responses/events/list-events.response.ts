import type { Event, EventStatus, EventSource } from '@domain/entities/event.js';

import { PaginatedResult } from '../paginated-result.js';

export class EventSummaryResponse {
  readonly id:          string;
  readonly topicId:     string;
  readonly status:      EventStatus;
  readonly source:      EventSource;
  readonly scheduledAt: string;
  readonly processedAt: string | null;
  readonly createdAt:   string;

  constructor(event: Event) {
    this.id          = event.id;
    this.topicId     = event.topicId;
    this.status      = event.status;
    this.source      = event.source;
    this.scheduledAt = event.scheduledAt.toISOString();
    this.processedAt = event.processedAt?.toISOString() ?? null;
    this.createdAt   = event.createdAt.toISOString();
  }
}

export class ListEventsResponse {
  readonly items:       EventSummaryResponse[];
  readonly totalCount:  number;
  readonly totalPages:  number;
  readonly currentPage: number;
  readonly pageSize:    number;

  constructor(result: PaginatedResult<Event>) {
    this.items       = result.items.map((event) => new EventSummaryResponse(event));
    this.totalCount  = result.totalCount;
    this.totalPages  = result.totalPages;
    this.currentPage = result.currentPage;
    this.pageSize    = result.pageSize;
  }
}
