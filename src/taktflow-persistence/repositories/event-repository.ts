import { and, eq, count, desc, sql } from 'drizzle-orm';
import type { PgTableWithColumns, TableConfig } from 'drizzle-orm/pg-core';

import type { DrizzleDb } from '../database.js';
import { events } from '../schema/events.js';
import type { EventRow } from '../schema/events.js';
import { Event } from '@domain/entities/event.js';
import type { EventStatus, EventSource } from '@domain/entities/event.js';
import type { IEventRepository } from '@domain/interfaces/event-repository.interface.js';
import type { PaginationOptions } from '@domain/interfaces/pagination-options.interface.js';
import type { PagedData } from '@domain/interfaces/paged-data.interface.js';
import { BaseTenantRepository } from './base-tenant-repository.js';

export class EventRepository
  extends BaseTenantRepository<Event>
  implements IEventRepository {

  constructor(db: DrizzleDb) {
    super(db);
  }

  protected get table(): PgTableWithColumns<TableConfig> {
    return events as unknown as PgTableWithColumns<TableConfig>;
  }

  protected mapToDomain(row: Record<string, unknown>): Event {
    return EventRepository.toDomain(row as EventRow);
  }

  async findById(id: string, tenantId: string): Promise<Event | null> {
    const rows = await this.db
      .select()
      .from(events)
      .where(and(eq(events.id, id), eq(events.tenantId, tenantId)))
      .limit(1);

    const [row] = rows;
    return row ? EventRepository.toDomain(row) : null;
  }

  async findAll(tenantId: string, options?: { page?: number; pageSize?: number }): Promise<{ items: Event[]; totalCount: number }> {
    const page     = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 100;
    const offset   = (page - 1) * pageSize;

    const where = eq(events.tenantId, tenantId);

    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(events)
        .where(where)
        .limit(pageSize)
        .offset(offset)
        .orderBy(desc(events.createdAt)),
      this.db
        .select({ total: count() })
        .from(events)
        .where(where),
    ]);

    return { items: rows.map(EventRepository.toDomain), totalCount: countResult[0]?.total ?? 0 };
  }

  async create(entity: Event): Promise<Event> {
    const rows = await this.db
      .insert(events)
      .values({
        id:             entity.id,
        tenantId:       entity.tenantId,
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
    return EventRepository.toDomain(row);
  }

  async update(id: string, tenantId: string, updates: Partial<Event>): Promise<Event> {
    const rows = await this.db
      .update(events)
      .set({
        ...(updates.status !== undefined && { status: updates.status }),
        ...(updates.startedAt !== undefined && { startedAt: updates.startedAt }),
        ...(updates.processedAt !== undefined && { processedAt: updates.processedAt }),
        updatedAt: new Date(),
      })
      .where(and(eq(events.id, id), eq(events.tenantId, tenantId)))
      .returning();

    const [row] = rows;
    if (!row) throw new Error('Update returned no rows');
    return EventRepository.toDomain(row);
  }

  async findByTopicId(
    topicId: string,
    tenantId: string,
    options?: PaginationOptions,
  ): Promise<PagedData<Event>> {
    const page     = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 100;
    const offset   = (page - 1) * pageSize;

    const where = and(eq(events.topicId, topicId), eq(events.tenantId, tenantId));

    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(events)
        .where(where)
        .limit(pageSize)
        .offset(offset)
        .orderBy(desc(events.createdAt)),
      this.db
        .select({ total: count() })
        .from(events)
        .where(where),
    ]);

    return {
      items:      rows.map(EventRepository.toDomain),
      totalCount: countResult[0]?.total ?? 0,
    };
  }

  async findByIdempotencyKey(key: string, tenantId: string): Promise<Event | null> {
    const rows = await this.db
      .select()
      .from(events)
      .where(and(eq(events.idempotencyKey, key), eq(events.tenantId, tenantId)))
      .limit(1);

    const [row] = rows;
    return row ? EventRepository.toDomain(row) : null;
  }

  async countThisMonth(tenantId: string): Promise<number> {
    const result = await this.db
      .select({ total: count() })
      .from(events)
      .where(
        and(
          eq(events.tenantId, tenantId),
          sql`${events.createdAt} >= date_trunc('month', now())`,
        ),
      );

    return result[0]?.total ?? 0;
  }

  static toDomain(row: EventRow): Event {
    return new Event({
      id:             row.id,
      tenantId:       row.tenantId,
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
