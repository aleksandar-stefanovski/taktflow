import { and, count, desc, eq, sql, type SQL } from 'drizzle-orm';

import type { DrizzleDb } from '../database.js';
import { events } from '../schema/events.js';
import type { EventRow } from '../schema/events.js';
import { Event } from '@domain/entities/event.js';
import type { IEventRepository } from '@domain/interfaces/event-repository.interface.js';
import type { ICurrentTenantProvider } from '@domain/interfaces/current-tenant-provider.interface.js';
import { EventReadonlyRepository } from './readonly/event-readonly-repository.js';
import { EntityBaseRepository } from './entity-base-repository.js';

export class EventRepository
  extends EntityBaseRepository<Event>
  implements IEventRepository {

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

    return result[0]?.total ?? 0;
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

    return result[0]?.total ?? 0;
  }

  async create(entity: Event): Promise<Event> {
    const rows = await this.db
      .insert(events)
      .values({
        id:             entity.id,
        tenantId:       entity.key.tenantId!,
        topicId:        entity.topicId,
        payload:        entity.payload,
        status:         entity.status,
        source:         entity.source,
        idempotencyKey: entity.idempotencyKey,
        checksum:       entity.checksum,
        scheduledAt:    entity.scheduledAt,
        startedAt:      entity.startedAt,
        processedAt:    entity.processedAt,
        createdAt:      entity.createdAt,
        updatedAt:      entity.updatedAt,
      })
      .returning();

    const [row] = rows;
    if (!row) throw new Error('Insert returned no rows');
    return EventReadonlyRepository.toDomain(row);
  }

  async update(id: string, updates: Partial<Event>): Promise<Event> {
    const rows = await this.db
      .update(events)
      .set({
        ...(updates.status !== undefined && { status: updates.status }),
        ...(updates.startedAt !== undefined && { startedAt: updates.startedAt }),
        ...(updates.processedAt !== undefined && { processedAt: updates.processedAt }),
        updatedAt: new Date(),
      })
      .where(and(eq(events.id, id), eq(events.tenantId, this.tenantId)))
      .returning();

    const [row] = rows;
    if (!row) throw new Error('Update returned no rows');
    return EventReadonlyRepository.toDomain(row);
  }

  override async delete(id: string): Promise<void> {
    await this.db
      .delete(events)
      .where(and(eq(events.id, id), eq(events.tenantId, this.tenantId)));
  }
}
