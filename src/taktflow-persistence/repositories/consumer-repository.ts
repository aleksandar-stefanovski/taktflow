import { and, eq, count, isNull } from 'drizzle-orm';
import type { PgTableWithColumns, TableConfig } from 'drizzle-orm/pg-core';

import type { DrizzleDb } from '../database.js';
import { consumers } from '../schema/consumers.js';
import type { ConsumerRow } from '../schema/consumers.js';
import { Consumer } from '@domain/entities/consumer.js';
import type { ConsumerType, ConsumerStatus } from '@domain/entities/consumer.js';
import type { ConsumerConfig } from '@domain/interfaces/consumer-config.interface.js';
import type { IConsumerRepository } from '@domain/interfaces/consumer-repository.interface.js';
import type { PaginationOptions } from '@domain/interfaces/pagination-options.interface.js';
import type { PagedData } from '@domain/interfaces/paged-data.interface.js';
import { BaseTenantRepository } from './base-tenant-repository.js';

export class ConsumerRepository
  extends BaseTenantRepository<Consumer>
  implements IConsumerRepository {

  constructor(db: DrizzleDb) {
    super(db);
  }

  protected get table(): PgTableWithColumns<TableConfig> {
    return consumers as unknown as PgTableWithColumns<TableConfig>;
  }

  protected mapToDomain(row: Record<string, unknown>): Consumer {
    return ConsumerRepository.toDomain(row as ConsumerRow);
  }

  async create(entity: Consumer): Promise<Consumer> {
    const rows = await this.db
      .insert(consumers)
      .values({
        id:          entity.id,
        tenantId:    entity.tenantId,
        topicId:     entity.topicId,
        name:        entity.name,
        type:        entity.type,
        url:         entity.url,
        secret:      entity.secret,
        environment: entity.environment,
        status:      entity.status,
        config:      entity.config,
        createdAt:   entity.createdAt,
        updatedAt:   entity.updatedAt,
      })
      .returning();

    const [row] = rows;
    if (!row) throw new Error('Insert returned no rows');
    return ConsumerRepository.toDomain(row);
  }

  async update(id: string, tenantId: string, updates: Partial<Consumer>): Promise<Consumer> {
    const rows = await this.db
      .update(consumers)
      .set({
        ...(updates.name !== undefined && { name: updates.name }),
        ...(updates.url !== undefined && { url: updates.url }),
        ...(updates.status !== undefined && { status: updates.status }),
        ...(updates.config !== undefined && { config: updates.config }),
        updatedAt: new Date(),
      })
      .where(and(eq(consumers.id, id), eq(consumers.tenantId, tenantId)))
      .returning();

    const [row] = rows;
    if (!row) throw new Error('Update returned no rows');
    return ConsumerRepository.toDomain(row);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.db
      .update(consumers)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(consumers.id, id), eq(consumers.tenantId, tenantId)));
  }

  async findByTopicId(
    topicId: string,
    tenantId: string,
    options?: PaginationOptions,
  ): Promise<PagedData<Consumer>> {
    const page     = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 100;
    const offset   = (page - 1) * pageSize;

    const where = and(
      eq(consumers.topicId, topicId),
      eq(consumers.tenantId, tenantId),
      isNull(consumers.deletedAt),
    );

    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(consumers)
        .where(where)
        .limit(pageSize)
        .offset(offset),
      this.db
        .select({ total: count() })
        .from(consumers)
        .where(where),
    ]);

    return { items: rows.map(ConsumerRepository.toDomain), totalCount: countResult[0]?.total ?? 0 };
  }

  static toDomain(row: ConsumerRow): Consumer {
    const entity = new Consumer({
      id:          row.id,
      tenantId:    row.tenantId,
      topicId:     row.topicId,
      name:        row.name,
      type:        row.type as ConsumerType,
      url:         row.url ?? null,
      secret:      row.secret,
      environment: row.environment,
      status:      row.status as ConsumerStatus,
      config:      row.config as Partial<ConsumerConfig>,
      createdAt:   row.createdAt,
      updatedAt:   row.updatedAt,
    });
    entity.deletedAt = row.deletedAt ?? null;
    return entity;
  }
}
