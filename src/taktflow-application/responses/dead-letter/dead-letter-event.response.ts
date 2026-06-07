import type { DeadLetterEvent } from '@domain/entities/dead-letter-event.js';

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

  static mapFromEntity(event: DeadLetterEvent): DeadLetterEventResponse {
    return new DeadLetterEventResponse(event);
  }
}

