import { BaseEntity } from './base-entity.js';
import type { HasTenant } from '../interfaces/has-tenant.interface.js';

export type DeliveryStatus =
  | 'pending'
  | 'processing'
  | 'awaiting_ack'
  | 'delivered'
  | 'failed'
  | 'dead_letter';

export class EventDelivery extends BaseEntity implements HasTenant {
  readonly tenantId: string;
  readonly eventId: string;
  readonly consumerId: string;
  status: DeliveryStatus;
  retryCount: number;
  readonly scheduledAt: Date;
  startedAt: Date | null;
  deliveredAt: Date | null;
  responseStatus: number | null;
  responseBody: string | null;
  errorMessage: string | null;

  constructor(props: {
    tenantId: string;
    eventId: string;
    consumerId: string;
    status?: DeliveryStatus;
    retryCount?: number;
    scheduledAt?: Date;
    startedAt?: Date | null;
    deliveredAt?: Date | null;
    responseStatus?: number | null;
    responseBody?: string | null;
    errorMessage?: string | null;
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    super(props.id, props.createdAt, props.updatedAt);
    this.tenantId = props.tenantId;
    this.eventId = props.eventId;
    this.consumerId = props.consumerId;
    this.status = props.status ?? 'pending';
    this.retryCount = props.retryCount ?? 0;
    this.scheduledAt = props.scheduledAt ?? new Date();
    this.startedAt = props.startedAt ?? null;
    this.deliveredAt = props.deliveredAt ?? null;
    this.responseStatus = props.responseStatus ?? null;
    this.responseBody = props.responseBody ?? null;
    this.errorMessage = props.errorMessage ?? null;
  }
}
