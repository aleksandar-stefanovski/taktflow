import { and, count, desc, eq, sql, type SQL } from 'drizzle-orm';
import { firstCount } from '../../query.helper.js';

import type { DrizzleDb } from '../../database.js';
import { events } from '../../schema/events.js';
import type { EventRow } from '../../schema/events.js';
import { Event } from '@taktflow/domain/entities/event.js';
import type { EventStatus, EventSource } from '@taktflow/domain/entities/event.js';
import { EntityKey } from '@taktflow/domain/entities/entity-key.js';
import type { ICurrentTenantProvider } from '@taktflow/domain/interfaces/current-tenant-provider.interface.js';
import { EntityBaseReadonlyRepository } from './entity-base-readonly-repository.js';

export class EventReadonlyRepository extends EntityBaseReadonlyRepository<Event> {
  constructor(db: DrizzleDb, tenantProvider: ICurrentTenantProvider) {
    super(db, events, tenantProvider);
  }

  protected override requiredFilters(): SQL {
    return eq(this.table['tenantId']!, this.tenantId);
  }

  protected mapToDomain(row: Record<string, unknown>): Event {
    return EventReadonlyRepository.toDomain(row as EventRow);
  }

  async findByTopicId(topicId: string, limit: number, offset: number): Promise<Event[]> {
    const rows = await this.db
      .select()
      .from(events)
      .where(and(eq(events.topicId, topicId), eq(events.tenantId, this.tenantId)))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(events.createdAt));

    return rows.map(EventReadonlyRepository.toDomain);
  }

  async countByTopicId(topicId: string): Promise<number> {
    const result = await this.db
      .select({ total: count() })
      .from(events)
      .where(and(eq(events.topicId, topicId), eq(events.tenantId, this.tenantId)));

    return firstCount(result);
  }

  async findByIdempotencyKey(key: string): Promise<Event | null> {
    const rows = await this.db
      .select()
      .from(events)
      .where(and(eq(events.idempotencyKey, key), eq(events.tenantId, this.tenantId)))
      .limit(1);

    const [row] = rows;
    return row ? EventReadonlyRepository.toDomain(row) : null;
  }

  async countThisMonth(): Promise<number> {
    const result = await this.db
      .select({ total: count() })
      .from(events)
      .where(and(
        eq(events.tenantId, this.tenantId),
        sql`${events.createdAt} >= date_trunc('month', now())`,
      ));

    return firstCount(result);
  }

  static toDomain(row: EventRow): Event {
    return new Event({
      key:            EntityKey.reconstitute(row.id, row.tenantId),
      topicId:        row.topicId,
      payload:        row.payload as Record<string, unknown>,
      status:         row.status as EventStatus,
      source:         row.source as EventSource,
      idempotencyKey: row.idempotencyKey ?? null,
      checksum:       row.checksum,
      scheduledAt:    row.scheduledAt,
      startedAt:      row.startedAt ?? null,
      processedAt:    row.processedAt ?? null,
      createdAt:      row.createdAt,
      updatedAt:      row.updatedAt,
    });
  }
}
