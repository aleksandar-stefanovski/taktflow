import { and, eq, type SQL } from 'drizzle-orm';

import type { DrizzleDb } from '../../database.js';
import { deadLetterEvents } from '../../schema/dead-letter-events.js';
import type { DeadLetterEventRow } from '../../schema/dead-letter-events.js';
import { DeadLetterEvent } from '@domain/entities/dead-letter-event.js';
import { EntityKey } from '@domain/entities/entity-key.js';
import type { ICurrentTenantProvider } from '@domain/interfaces/current-tenant-provider.interface.js';
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

  static toDomain(row: DeadLetterEventRow): DeadLetterEvent {
    return new DeadLetterEvent({
      key:             EntityKey.reconstitute(row.id, row.tenantId),
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
