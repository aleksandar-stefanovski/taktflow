import { and, eq, isNull } from 'drizzle-orm';
import type { PgTableWithColumns, TableConfig } from 'drizzle-orm/pg-core';

import type { DrizzleDb } from '../database.js';
import { topics } from '../schema/topics.js';
import type { TopicRow } from '../schema/topics.js';
import { Topic } from '@domain/entities/topic.js';
import type { TopicConfig } from '@domain/interfaces/topic-config.interface.js';
import type { ITopicRepository } from '@domain/interfaces/topic-repository.interface.js';
import { BaseTenantRepository } from './base-tenant-repository.js';

export class TopicRepository
  extends BaseTenantRepository<Topic>
  implements ITopicRepository {

  constructor(db: DrizzleDb) {
    super(db);
  }

  protected get table(): PgTableWithColumns<TableConfig> {
    return topics as unknown as PgTableWithColumns<TableConfig>;
  }

  protected mapToDomain(row: Record<string, unknown>): Topic {
    return TopicRepository.toDomain(row as TopicRow);
  }

  async create(entity: Topic): Promise<Topic> {
    const rows = await this.db
      .insert(topics)
      .values({
        id:        entity.id,
        tenantId:  entity.tenantId,
        name:      entity.name,
        config:    entity.config,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      })
      .returning();

    const [row] = rows;
    if (!row) throw new Error('Insert returned no rows');
    return TopicRepository.toDomain(row);
  }

  async update(id: string, tenantId: string, updates: Partial<Topic>): Promise<Topic> {
    const rows = await this.db
      .update(topics)
      .set({
        ...(updates.name !== undefined && { name: updates.name }),
        ...(updates.config !== undefined && { config: updates.config }),
        updatedAt: new Date(),
      })
      .where(and(eq(topics.id, id), eq(topics.tenantId, tenantId)))
      .returning();

    const [row] = rows;
    if (!row) throw new Error('Update returned no rows');
    return TopicRepository.toDomain(row);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.db
      .update(topics)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(topics.id, id), eq(topics.tenantId, tenantId)));
  }

  async findByName(name: string, tenantId: string): Promise<Topic | null> {
    const rows = await this.db
      .select()
      .from(topics)
      .where(and(eq(topics.name, name), eq(topics.tenantId, tenantId), isNull(topics.deletedAt)))
      .limit(1);

    const [row] = rows;
    return row ? TopicRepository.toDomain(row) : null;
  }

  static toDomain(row: TopicRow): Topic {
    const entity = new Topic({
      id:        row.id,
      tenantId:  row.tenantId,
      name:      row.name,
      config:    row.config as Partial<TopicConfig>,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
    entity.deletedAt = row.deletedAt ?? null;
    return entity;
  }
}
