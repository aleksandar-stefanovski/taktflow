import { and, eq, sql } from 'drizzle-orm';
import type { PgTableWithColumns, TableConfig } from 'drizzle-orm/pg-core';

import type { DrizzleDb } from '../database.js';
import { eventDeliveries } from '../schema/event-deliveries.js';
import type { EventDeliveryRow } from '../schema/event-deliveries.js';
import { EventDelivery } from '@domain/entities/event-delivery.js';
import type { DeliveryStatus } from '@domain/entities/event-delivery.js';
import type { IEventDeliveryRepository } from '@domain/interfaces/event-delivery-repository.interface.js';
import { BaseTenantRepository } from './base-tenant-repository.js';

export class EventDeliveryRepository
  extends BaseTenantRepository<EventDelivery>
  implements IEventDeliveryRepository {

  constructor(db: DrizzleDb) {
    super(db);
  }

  protected get table(): PgTableWithColumns<TableConfig> {
    return eventDeliveries as unknown as PgTableWithColumns<TableConfig>;
  }

  protected mapToDomain(row: Record<string, unknown>): EventDelivery {
    return EventDeliveryRepository.toDomain(row as EventDeliveryRow);
  }

  async create(entity: EventDelivery): Promise<EventDelivery> {
    const rows = await this.db
      .insert(eventDeliveries)
      .values({
        id:             entity.id,
        tenantId:       entity.tenantId,
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
    return EventDeliveryRepository.toDomain(row);
  }

  async update(id: string, tenantId: string, updates: Partial<EventDelivery>): Promise<EventDelivery> {
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
      .where(and(eq(eventDeliveries.id, id), eq(eventDeliveries.tenantId, tenantId)))
      .returning();

    const [row] = rows;
    if (!row) throw new Error('Update returned no rows');
    return EventDeliveryRepository.toDomain(row);
  }

  async findByEventId(eventId: string, tenantId: string): Promise<EventDelivery[]> {
    const rows = await this.db
      .select()
      .from(eventDeliveries)
      .where(and(eq(eventDeliveries.eventId, eventId), eq(eventDeliveries.tenantId, tenantId)));

    return rows.map(EventDeliveryRepository.toDomain);
  }

  async findByConsumerId(consumerId: string, tenantId: string): Promise<EventDelivery[]> {
    const rows = await this.db
      .select()
      .from(eventDeliveries)
      .where(and(eq(eventDeliveries.consumerId, consumerId), eq(eventDeliveries.tenantId, tenantId)));

    return rows.map(EventDeliveryRepository.toDomain);
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

  static toDomain(row: EventDeliveryRow): EventDelivery {
    return new EventDelivery({
      id:             row.id,
      tenantId:       row.tenantId,
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
