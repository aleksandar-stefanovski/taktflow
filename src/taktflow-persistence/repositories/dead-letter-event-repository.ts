import { and, eq, sql } from 'drizzle-orm';
import type { PgTableWithColumns, TableConfig } from 'drizzle-orm/pg-core';

import type { DrizzleDb } from '../database.js';
import { deadLetterEvents } from '../schema/dead-letter-events.js';
import type { DeadLetterEventRow } from '../schema/dead-letter-events.js';
import { DeadLetterEvent } from '@domain/entities/dead-letter-event.js';
import type { IDeadLetterEventRepository, FailureAlertRow } from '@domain/interfaces/dead-letter-event-repository.interface.js';
import { BaseTenantRepository } from './base-tenant-repository.js';

export class DeadLetterEventRepository
  extends BaseTenantRepository<DeadLetterEvent>
  implements IDeadLetterEventRepository {

  constructor(db: DrizzleDb) {
    super(db);
  }

  protected get table(): PgTableWithColumns<TableConfig> {
    return deadLetterEvents as unknown as PgTableWithColumns<TableConfig>;
  }

  protected mapToDomain(row: Record<string, unknown>): DeadLetterEvent {
    return DeadLetterEventRepository.toDomain(row as DeadLetterEventRow);
  }

  async create(entity: DeadLetterEvent): Promise<DeadLetterEvent> {
    const rows = await this.db
      .insert(deadLetterEvents)
      .values({
        id:              entity.id,
        tenantId:        entity.tenantId,
        eventDeliveryId: entity.eventDeliveryId,
        eventId:         entity.eventId,
        consumerId:      entity.consumerId,
        failureReason:   entity.failureReason,
        payloadSnapshot: entity.payloadSnapshot,
        replayed:        entity.replayed,
        replayedAt:      entity.replayedAt,
        createdAt:       entity.createdAt,
        updatedAt:       entity.updatedAt,
      })
      .returning();

    const [row] = rows;
    if (!row) throw new Error('Insert returned no rows');
    return DeadLetterEventRepository.toDomain(row);
  }

  async update(id: string, tenantId: string, updates: Partial<DeadLetterEvent>): Promise<DeadLetterEvent> {
    const rows = await this.db
      .update(deadLetterEvents)
      .set({
        ...(updates.replayed !== undefined && { replayed: updates.replayed }),
        ...(updates.replayedAt !== undefined && { replayedAt: updates.replayedAt }),
        updatedAt: new Date(),
      })
      .where(and(eq(deadLetterEvents.id, id), eq(deadLetterEvents.tenantId, tenantId)))
      .returning();

    const [row] = rows;
    if (!row) throw new Error('Update returned no rows');
    return DeadLetterEventRepository.toDomain(row);
  }

  async findUnreplayed(tenantId: string): Promise<DeadLetterEvent[]> {
    const rows = await this.db
      .select()
      .from(deadLetterEvents)
      .where(and(eq(deadLetterEvents.tenantId, tenantId), eq(deadLetterEvents.replayed, false)));

    return rows.map(DeadLetterEventRepository.toDomain);
  }

  async findOverFailureThreshold(): Promise<FailureAlertRow[]> {
    // NOTE: raw SQL required — CTE with JSONB extraction and cross-table threshold comparison not expressible in Drizzle
    const result = await this.db.execute<{
      consumerId: string;
      tenantId: string;
      failureCount: number;
      alertEmail: string;
    }>(sql`
      WITH recent_failures AS (
        SELECT consumer_id, tenant_id, COUNT(*)::int AS failure_count
        FROM dead_letter_events
        WHERE created_at > NOW() - INTERVAL '24 hours'
        GROUP BY consumer_id, tenant_id
      )
      SELECT rf.consumer_id AS "consumerId",
             rf.tenant_id   AS "tenantId",
             rf.failure_count AS "failureCount",
             c.config->>'alertEmail' AS "alertEmail"
      FROM recent_failures rf
      JOIN consumers c ON c.id = rf.consumer_id
      WHERE rf.failure_count >= (c.config->>'alertAfterFailures')::int
        AND c.config->>'alertEmail' IS NOT NULL
    `);

    return result.rows;
  }

  static toDomain(row: DeadLetterEventRow): DeadLetterEvent {
    return new DeadLetterEvent({
      id:              row.id,
      tenantId:        row.tenantId,
      eventDeliveryId: row.eventDeliveryId,
      eventId:         row.eventId,
      consumerId:      row.consumerId,
      failureReason:   row.failureReason,
      payloadSnapshot: row.payloadSnapshot as Record<string, unknown>,
      replayed:        row.replayed,
      replayedAt:      row.replayedAt ?? null,
      createdAt:       row.createdAt,
      updatedAt:       row.updatedAt,
    });
  }
}
