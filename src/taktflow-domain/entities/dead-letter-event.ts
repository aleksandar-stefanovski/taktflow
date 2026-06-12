import { EntityBase } from './entity-base.js';
import { EntityKey } from './entity-key.js';

export class DeadLetterEvent extends EntityBase {
  readonly eventDeliveryId: string;
  readonly eventId:         string;
  readonly consumerId:      string;
  readonly failureReason:   string;
  readonly payloadSnapshot: Record<string, unknown>;
  replayed:                 boolean;
  replayedAt:               Date | null;

  constructor(props: {
    key:             EntityKey;
    eventDeliveryId: string;
    eventId:         string;
    consumerId:      string;
    failureReason:   string;
    payloadSnapshot: Record<string, unknown>;
    replayed?:       boolean;
    replayedAt?:     Date | null;
    createdAt?:      Date;
    updatedAt?:      Date;
  }) {
    super(props.key, props.createdAt, props.updatedAt);
    this.eventDeliveryId = props.eventDeliveryId;
    this.eventId         = props.eventId;
    this.consumerId      = props.consumerId;
    this.failureReason   = props.failureReason;
    this.payloadSnapshot = props.payloadSnapshot;
    this.replayed        = props.replayed ?? false;
    this.replayedAt      = props.replayedAt ?? null;
  }
}
