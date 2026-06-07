import type { Event, EventStatus, EventSource } from '@domain/entities/event.js';

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

  static mapFromEntity(event: Event): EventSummaryResponse {
    return new EventSummaryResponse(event);
  }
}
