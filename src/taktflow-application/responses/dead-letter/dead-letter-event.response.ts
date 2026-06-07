import type { DeadLetterEvent } from '@domain/entities/dead-letter-event.js';

import { PaginatedResult } from '../paginated-result.js';

export class DeadLetterEventResponse {
  readonly id:               string;
  readonly eventId:          string;
  readonly consumerId:       string;
  readonly eventDeliveryId:  string;
  readonly failureReason:    string;
  readonly payloadSnapshot:  Record<string, unknown>;
  readonly replayed:         boolean;
  readonly replayedAt:       string | null;
  readonly createdAt:        string;

  constructor(event: DeadLetterEvent) {
    this.id              = event.id;
    this.eventId         = event.eventId;
    this.consumerId      = event.consumerId;
    this.eventDeliveryId = event.eventDeliveryId;
    this.failureReason   = event.failureReason;
    this.payloadSnapshot = event.payloadSnapshot;
    this.replayed        = event.replayed;
    this.replayedAt      = event.replayedAt?.toISOString() ?? null;
    this.createdAt       = event.createdAt.toISOString();
  }
}

export class ListDeadLetterEventsResponse {
  readonly items:       DeadLetterEventResponse[];
  readonly totalCount:  number;
  readonly totalPages:  number;
  readonly currentPage: number;
  readonly pageSize:    number;

  constructor(result: PaginatedResult<DeadLetterEvent>) {
    this.items       = result.items.map((e) => new DeadLetterEventResponse(e));
    this.totalCount  = result.totalCount;
    this.totalPages  = result.totalPages;
    this.currentPage = result.currentPage;
    this.pageSize    = result.pageSize;
  }
}
