import { BaseEntity } from './base-entity.js';
import type { HasTenant } from '../interfaces/has-tenant.interface.js';

export type EventStatus = 'pending' | 'processing' | 'delivered' | 'failed';
export type EventSource = 'sdk' | 'scheduler' | 'manual';

export class Event extends BaseEntity implements HasTenant {
  readonly tenantId: string;
  readonly topicId: string;
  readonly payload: Record<string, unknown>;
  status: EventStatus;
  readonly source: EventSource;
  readonly idempotencyKey: string | null;
  readonly checksum: string;
  readonly scheduledAt: Date;
  startedAt: Date | null;
  processedAt: Date | null;

  constructor(props: {
    tenantId: string;
    topicId: string;
    payload: Record<string, unknown>;
    checksum: string;
    source?: EventSource;
    idempotencyKey?: string | null;
    status?: EventStatus;
    scheduledAt?: Date;
    startedAt?: Date | null;
    processedAt?: Date | null;
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    super(props.id, props.createdAt, props.updatedAt);
    this.tenantId = props.tenantId;
    this.topicId = props.topicId;
    this.payload = props.payload;
    this.checksum = props.checksum;
    this.source = props.source ?? 'sdk';
    this.idempotencyKey = props.idempotencyKey ?? null;
    this.status = props.status ?? 'pending';
    this.scheduledAt = props.scheduledAt ?? new Date();
    this.startedAt = props.startedAt ?? null;
    this.processedAt = props.processedAt ?? null;
  }
}
