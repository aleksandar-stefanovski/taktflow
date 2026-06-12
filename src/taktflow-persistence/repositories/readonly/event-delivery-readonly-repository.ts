import { and, eq, type SQL } from 'drizzle-orm';

import type { DrizzleDb } from '../../database.js';
import { eventDeliveries } from '../../schema/event-deliveries.js';
import type { EventDeliveryRow } from '../../schema/event-deliveries.js';
import { EventDelivery } from '@domain/entities/event-delivery.js';
import type { DeliveryStatus } from '@domain/entities/event-delivery.js';
import { EntityKey } from '@domain/entities/entity-key.js';
import type { ICurrentTenantProvider } from '@domain/interfaces/current-tenant-provider.interface.js';
import { EntityBaseReadonlyRepository } from './entity-base-readonly-repository.js';

export class EventDeliveryReadonlyRepository extends EntityBaseReadonlyRepository<EventDelivery> {
  constructor(db: DrizzleDb, tenantProvider: ICurrentTenantProvider) {
    super(db, eventDeliveries, tenantProvider);
  }

  protected override requiredFilters(): SQL {
    return eq(this.table['tenantId']!, this.tenantId);
  }

  protected mapToDomain(row: Record<string, unknown>): EventDelivery {
    return EventDeliveryReadonlyRepository.toDomain(row as EventDeliveryRow);
  }

  async findByEventId(eventId: string): Promise<EventDelivery[]> {
    const rows = await this.db
      .select()
      .from(eventDeliveries)
      .where(and(eq(eventDeliveries.eventId, eventId), eq(eventDeliveries.tenantId, this.tenantId)));

    return rows.map(EventDeliveryReadonlyRepository.toDomain);
  }

  async findByConsumerId(consumerId: string): Promise<EventDelivery[]> {
    const rows = await this.db
      .select()
      .from(eventDeliveries)
      .where(and(eq(eventDeliveries.consumerId, consumerId), eq(eventDeliveries.tenantId, this.tenantId)));

    return rows.map(EventDeliveryReadonlyRepository.toDomain);
  }

  static toDomain(row: EventDeliveryRow): EventDelivery {
    return new EventDelivery({
      key:            new EntityKey(row.id, row.tenantId),
      eventId:        row.eventId,
      consumerId:     row.consumerId,
      status:         row.status as DeliveryStatus,
      retryCount:     row.retryCount,
      scheduledAt:    row.scheduledAt,
      startedAt:      row.startedAt ?? null,
      deliveredAt:    row.deliveredAt ?? null,
      responseStatus: row.responseStatus ?? null,
      responseBody:   row.responseBody ?? null,
      errorMessage:   row.errorMessage ?? null,
      createdAt:      row.createdAt,
      updatedAt:      row.updatedAt,
    });
  }
}
