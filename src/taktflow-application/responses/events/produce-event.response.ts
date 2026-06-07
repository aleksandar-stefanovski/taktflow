import type { Event, EventStatus, EventSource } from '@domain/entities/event.js';

export class ProduceEventResponse {
  readonly eventId:   string;
  readonly topicId:   string;
  readonly status:    EventStatus;
  readonly source:    EventSource;
  readonly createdAt: string;

  constructor(event: Event) {
    this.eventId   = event.id;
    this.topicId   = event.topicId;
    this.status    = event.status;
    this.source    = event.source;
    this.createdAt = event.createdAt.toISOString();
  }

  static mapFromEntity(event: Event): ProduceEventResponse {
    return new ProduceEventResponse(event);
  }
}
