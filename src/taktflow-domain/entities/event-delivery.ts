import { EntityBase } from './entity-base.js';
import { EntityKey } from './entity-key.js';

export type DeliveryStatus =
  | 'pending'
  | 'processing'
  | 'awaiting_ack'
  | 'delivered'
  | 'failed'
  | 'dead_letter';

export class EventDelivery extends EntityBase {
  readonly eventId:       string;
  readonly consumerId:    string;
  status:                 DeliveryStatus;
  retryCount:             number;
  readonly scheduledAt:   Date;
  startedAt:              Date | null;
  deliveredAt:            Date | null;
  responseStatus:         number | null;
  responseBody:           string | null;
  errorMessage:           string | null;

  constructor(props: {
    key:             EntityKey;
    eventId:         string;
    consumerId:      string;
    status?:         DeliveryStatus;
    retryCount?:     number;
    scheduledAt?:    Date;
    startedAt?:      Date | null;
    deliveredAt?:    Date | null;
    responseStatus?: number | null;
    responseBody?:   string | null;
    errorMessage?:   string | null;
    createdAt?:      Date;
    updatedAt?:      Date;
  }) {
    super(props.key, props.createdAt, props.updatedAt);
    this.eventId        = props.eventId;
    this.consumerId     = props.consumerId;
    this.status         = props.status ?? 'pending';
    this.retryCount     = props.retryCount ?? 0;
    this.scheduledAt    = props.scheduledAt ?? new Date();
    this.startedAt      = props.startedAt ?? null;
    this.deliveredAt    = props.deliveredAt ?? null;
    this.responseStatus = props.responseStatus ?? null;
    this.responseBody   = props.responseBody ?? null;
    this.errorMessage   = props.errorMessage ?? null;
  }
}
