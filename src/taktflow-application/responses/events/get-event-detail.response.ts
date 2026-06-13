import type { Event, EventStatus, EventSource } from '@taktflow/domain/entities/event.js';

export class GetEventDetailResponse {
  readonly id:             string;
  readonly topicId:        string;
  readonly status:         EventStatus;
  readonly source:         EventSource;
  readonly payload:        Record<string, unknown>;
  readonly checksum:       string;
  readonly idempotencyKey: string | null;
  readonly scheduledAt:    string;
  readonly startedAt:      string | null;
  readonly processedAt:    string | null;
  readonly createdAt:      string;
  readonly updatedAt:      string;

  constructor(event: Event) {
    this.id             = event.id;
    this.topicId        = event.topicId;
    this.status         = event.status;
    this.source         = event.source;
    this.payload        = event.payload;
    this.checksum       = event.checksum;
    this.idempotencyKey = event.idempotencyKey;
    this.scheduledAt    = event.scheduledAt.toISOString();
    this.startedAt      = event.startedAt?.toISOString() ?? null;
    this.processedAt    = event.processedAt?.toISOString() ?? null;
    this.createdAt      = event.createdAt.toISOString();
    this.updatedAt      = event.updatedAt.toISOString();
  }

  static mapFromEntity(event: Event): GetEventDetailResponse {
    return new GetEventDetailResponse(event);
  }
}
