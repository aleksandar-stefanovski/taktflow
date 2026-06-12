import { and, eq, sql, type SQL } from 'drizzle-orm';

import type { DrizzleDb } from '../database.js';
import { eventDeliveries } from '../schema/event-deliveries.js';
import type { EventDeliveryRow } from '../schema/event-deliveries.js';
import { EventDelivery } from '@domain/entities/event-delivery.js';
import type { IEventDeliveryRepository } from '@domain/interfaces/event-delivery-repository.interface.js';
import type { ICurrentTenantProvider } from '@domain/interfaces/current-tenant-provider.interface.js';
import { EventDeliveryReadonlyRepository } from './readonly/event-delivery-readonly-repository.js';
import { EntityBaseRepository } from './entity-base-repository.js';

export class EventDeliveryRepository
  extends EntityBaseRepository<EventDelivery>
  implements IEventDeliveryRepository {

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

  async create(entity: EventDelivery): Promise<EventDelivery> {
    const rows = await this.db
      .insert(eventDeliveries)
      .values({
        id:             entity.id,
        tenantId:       entity.key.tenantId!,
        eventId:        entity.eventId,
        consumerId:     entity.consumerId,
        status:         entity.status,
        retryCount:     entity.retryCount,
        scheduledAt:    entity.scheduledAt,
        startedAt:      entity.startedAt,
        deliveredAt:    entity.deliveredAt,
        responseStatus: entity.responseStatus,
        responseBody:   entity.responseBody,
        errorMessage:   entity.errorMessage,
        createdAt:      entity.createdAt,
        updatedAt:      entity.updatedAt,
      })
      .returning();

    const [row] = rows;
    if (!row) throw new Error('Insert returned no rows');
    return EventDeliveryReadonlyRepository.toDomain(row);
  }

  async update(id: string, updates: Partial<EventDelivery>): Promise<EventDelivery> {
    const rows = await this.db
      .update(eventDeliveries)
      .set({
        ...(updates.status !== undefined && { status: updates.status }),
        ...(updates.retryCount !== undefined && { retryCount: updates.retryCount }),
        ...(updates.startedAt !== undefined && { startedAt: updates.startedAt }),
        ...(updates.deliveredAt !== undefined && { deliveredAt: updates.deliveredAt }),
        ...(updates.responseStatus !== undefined && { responseStatus: updates.responseStatus }),
        ...(updates.responseBody !== undefined && { responseBody: updates.responseBody }),
        ...(updates.errorMessage !== undefined && { errorMessage: updates.errorMessage }),
        updatedAt: new Date(),
      })
      .where(and(eq(eventDeliveries.id, id), eq(eventDeliveries.tenantId, this.tenantId)))
      .returning();

    const [row] = rows;
    if (!row) throw new Error('Update returned no rows');
    return EventDeliveryReadonlyRepository.toDomain(row);
  }

  override async delete(id: string): Promise<void> {
    await this.db
      .delete(eventDeliveries)
      .where(and(eq(eventDeliveries.id, id), eq(eventDeliveries.tenantId, this.tenantId)));
  }

  async resetTimedOutAcks(awaitingAckTimeoutHours: number): Promise<void> {
    await this.db
      .update(eventDeliveries)
      .set({
        status:      'pending',
        retryCount:  sql`${eventDeliveries.retryCount} + 1`,
        scheduledAt: sql`NOW()`,
        updatedAt:   new Date(),
      })
      .where(and(
        eq(eventDeliveries.status, 'awaiting_ack'),
        sql`${eventDeliveries.startedAt} < NOW() - (${awaitingAckTimeoutHours} * INTERVAL '1 hour')`,
      ));
  }

  async releaseStuckDeliveries(stuckThresholdMs: number): Promise<number> {
    const result = await this.db
      .update(eventDeliveries)
      .set({
        status:    'pending',
        startedAt: null,
        updatedAt: new Date(),
      })
      .where(and(
        eq(eventDeliveries.status, 'processing'),
        sql`${eventDeliveries.startedAt} < NOW() - (${stuckThresholdMs} * INTERVAL '1 millisecond')`,
      ))
      .returning({ id: eventDeliveries.id });

    return result.length;
  }
}
