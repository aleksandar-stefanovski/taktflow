import { and, eq, type SQL } from 'drizzle-orm';

import type { DrizzleDb } from '../database.js';
import { deadLetterEvents } from '../schema/dead-letter-events.js';
import type { DeadLetterEventRow } from '../schema/dead-letter-events.js';
import { DeadLetterEvent } from '@taktflow/domain/entities/dead-letter-event.js';
import type { IDeadLetterEventRepository } from '@taktflow/domain/interfaces/dead-letter-event-repository.interface.js';
import type { ICurrentTenantProvider } from '@taktflow/domain/interfaces/current-tenant-provider.interface.js';
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
