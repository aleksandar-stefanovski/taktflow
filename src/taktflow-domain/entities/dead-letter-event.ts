import { BaseEntity } from './base-entity.js';
import type { HasTenant } from '../interfaces/has-tenant.interface.js';

export class DeadLetterEvent extends BaseEntity implements HasTenant {
  readonly tenantId: string;
  readonly eventDeliveryId: string;
  readonly eventId: string;
  readonly consumerId: string;
  readonly failureReason: string;
  readonly payloadSnapshot: Record<string, unknown>;
  replayed: boolean;
  replayedAt: Date | null;

  constructor(props: {
    tenantId: string;
    eventDeliveryId: string;
    eventId: string;
    consumerId: string;
    failureReason: string;
    payloadSnapshot: Record<string, unknown>;
    replayed?: boolean;
    replayedAt?: Date | null;
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    super(props.id, props.createdAt, props.updatedAt);
    this.tenantId = props.tenantId;
    this.eventDeliveryId = props.eventDeliveryId;
    this.eventId = props.eventId;
    this.consumerId = props.consumerId;
    this.failureReason = props.failureReason;
    this.payloadSnapshot = props.payloadSnapshot;
    this.replayed = props.replayed ?? false;
    this.replayedAt = props.replayedAt ?? null;
  }
}
