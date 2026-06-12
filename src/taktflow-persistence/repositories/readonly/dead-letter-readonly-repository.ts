import { and, eq, sql, type SQL } from 'drizzle-orm';

import type { DrizzleDb } from '../../database.js';
import { deadLetterEvents } from '../../schema/dead-letter-events.js';
import type { DeadLetterEventRow } from '../../schema/dead-letter-events.js';
import { DeadLetterEvent } from '@domain/entities/dead-letter-event.js';
import { EntityKey } from '@domain/entities/entity-key.js';
import type { ICurrentTenantProvider } from '@domain/interfaces/current-tenant-provider.interface.js';
import type { FailureAlertRow } from '@domain/interfaces/readonly/failure-alert-row.interface.js';
import { EntityBaseReadonlyRepository } from './entity-base-readonly-repository.js';

export class DeadLetterReadonlyRepository extends EntityBaseReadonlyRepository<DeadLetterEvent> {
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

  static toDomain(row: DeadLetterEventRow): DeadLetterEvent {
    return new DeadLetterEvent({
      key:             new EntityKey(row.id, row.tenantId),
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
