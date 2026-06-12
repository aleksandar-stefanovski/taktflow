import { and, eq, sql, type SQL } from 'drizzle-orm';

import type { DrizzleDb } from '../database.js';
import { deadLetterEvents } from '../schema/dead-letter-events.js';
import type { DeadLetterEventRow } from '../schema/dead-letter-events.js';
import { DeadLetterEvent } from '@domain/entities/dead-letter-event.js';
import type { IDeadLetterEventRepository } from '@domain/interfaces/dead-letter-event-repository.interface.js';
import type { ICurrentTenantProvider } from '@domain/interfaces/current-tenant-provider.interface.js';
import type { FailureAlertRow } from '@domain/interfaces/readonly/failure-alert-row.interface.js';
import { DeadLetterReadonlyRepository } from './readonly/dead-letter-readonly-repository.js';
import { EntityBaseRepository } from './entity-base-repository.js';

export class DeadLetterEventRepository
  extends EntityBaseRepository<DeadLetterEvent>
  implements IDeadLetterEventRepository {

  constructor(db: DrizzleDb, tenantProvider: ICurrentTenantProvider) {
    super(db, deadLetterEvents, tenantProvider);
  }

  protected override requiredFilters(): SQL {
    return eq(this.table['tenantId']!, this.tenantId);
  }

  protected mapToDomain(row: Record<string, unknown>): DeadLetterEvent {
    return DeadLetterReadonlyRepository.toDomain(row as DeadLetterEventRow);
  }

  async findUnreplayed(): Promise<DeadLetterEvent[]> {
    const rows = await this.db
      .select()
      .from(deadLetterEvents)
      .where(and(eq(deadLetterEvents.tenantId, this.tenantId), eq(deadLetterEvents.replayed, false)));

    return rows.map(DeadLetterReadonlyRepository.toDomain);
  }

  async findOverFailureThreshold(): Promise<FailureAlertRow[]> {
    // NOTE: raw SQL required — CTE with JSONB extraction and cross-table threshold comparison not expressible in Drizzle
    const result = await this.db.execute<{
      consumerId:   string;
      tenantId:     string;
      failureCount: number;
      alertEmail:   string;
    }>(sql`
      WITH recent_failures AS (
        SELECT consumer_id, tenant_id, COUNT(*)::int AS failure_count
        FROM dead_letter_events
        WHERE created_at > NOW() - INTERVAL '24 hours'
        GROUP BY consumer_id, tenant_id
      )
      SELECT rf.consumer_id    AS "consumerId",
             rf.tenant_id      AS "tenantId",
             rf.failure_count  AS "failureCount",
             c.alert_email     AS "alertEmail"
      FROM recent_failures rf
      JOIN consumers c ON c.id = rf.consumer_id
      WHERE rf.failure_count >= c.alert_after_failures
        AND c.alert_email IS NOT NULL
    `);

    return result.rows;
  }

  async create(entity: DeadLetterEvent): Promise<DeadLetterEvent> {
    const rows = await this.db
      .insert(deadLetterEvents)
      .values({
        id:              entity.id,
        tenantId:        entity.key.tenantId!,
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
    return DeadLetterReadonlyRepository.toDomain(row);
  }

  async update(id: string, updates: Partial<DeadLetterEvent>): Promise<DeadLetterEvent> {
    const rows = await this.db
      .update(deadLetterEvents)
      .set({
        ...(updates.replayed !== undefined && { replayed: updates.replayed }),
        ...(updates.replayedAt !== undefined && { replayedAt: updates.replayedAt }),
        updatedAt: new Date(),
      })
      .where(and(eq(deadLetterEvents.id, id), eq(deadLetterEvents.tenantId, this.tenantId)))
      .returning();

    const [row] = rows;
    if (!row) throw new Error('Update returned no rows');
    return DeadLetterReadonlyRepository.toDomain(row);
  }

  override async delete(id: string): Promise<void> {
    await this.db
      .delete(deadLetterEvents)
      .where(and(eq(deadLetterEvents.id, id), eq(deadLetterEvents.tenantId, this.tenantId)));
  }
}
