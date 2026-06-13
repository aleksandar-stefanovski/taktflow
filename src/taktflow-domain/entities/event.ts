import { EntityBase } from './entity-base.js';
import { EntityKey } from './entity-key.js';

export type EventStatus = 'pending' | 'processing' | 'delivered' | 'failed';
export type EventSource = 'api';

export class Event extends EntityBase {
  readonly topicId:       string;
  readonly payload:       Record<string, unknown>;
  status:                 EventStatus;
  readonly source:        EventSource;
  readonly idempotencyKey: string | null;
  readonly checksum:      string;
  readonly scheduledAt:   Date;
  startedAt:              Date | null;
  processedAt:            Date | null;

  constructor(props: {
    key:             EntityKey;
    topicId:         string;
    payload:         Record<string, unknown>;
    checksum:        string;
    source?:         EventSource;
    idempotencyKey?: string | null;
    status?:         EventStatus;
    scheduledAt?:    Date;
    startedAt?:      Date | null;
    processedAt?:    Date | null;
    createdAt?:      Date;
    updatedAt?:      Date;
  }) {
    super(props.key, props.createdAt, props.updatedAt);
    this.topicId        = props.topicId;
    this.payload        = props.payload;
    this.checksum       = props.checksum;
    this.source         = props.source ?? 'api';
    this.idempotencyKey = props.idempotencyKey ?? null;
    this.status         = props.status ?? 'pending';
    this.scheduledAt    = props.scheduledAt ?? new Date();
    this.startedAt      = props.startedAt ?? null;
    this.processedAt    = props.processedAt ?? null;
  }
}
