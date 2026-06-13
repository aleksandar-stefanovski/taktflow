import type { ClaimedEvent } from '@domain/types/claimed-event.type.js';

export class ConsumedEventResponse {
  readonly id:          string;
  readonly eventId:     string;
  readonly consumerId:  string;
  readonly topicId:     string;
  readonly payload:     Record<string, unknown>;
  readonly attempt:     number;
  readonly scheduledAt: string;

  constructor(event: ClaimedEvent) {
    this.id          = event.id;
    this.eventId     = event.eventId;
    this.consumerId  = event.consumerId;
    this.topicId     = event.topicId;
    this.payload     = event.payload;
    this.attempt     = event.attempt;
    this.scheduledAt = event.scheduledAt.toISOString();
  }

  static mapFromEntity(event: ClaimedEvent): ConsumedEventResponse {
    return new ConsumedEventResponse(event);
  }
}
