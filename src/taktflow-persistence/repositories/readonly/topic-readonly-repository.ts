import { and, eq, isNull } from 'drizzle-orm';

import type { DrizzleDb } from '../../database.js';
import { topics } from '../../schema/topics.js';
import type { TopicRow } from '../../schema/topics.js';
import { Topic } from '@domain/entities/topic.js';
import type { TopicConfig } from '@domain/value-objects/topic-config.js';
import { EntityKey } from '@domain/entities/entity-key.js';
import type { ICurrentTenantProvider } from '@domain/interfaces/current-tenant-provider.interface.js';
import { EntityBaseReadonlyRepository } from './entity-base-readonly-repository.js';

export class TopicReadonlyRepository extends EntityBaseReadonlyRepository<Topic> {
  constructor(db: DrizzleDb, tenantProvider: ICurrentTenantProvider) {
    super(db, topics, tenantProvider);
  }

  protected mapToDomain(row: Record<string, unknown>): Topic {
    return TopicReadonlyRepository.toDomain(row as TopicRow);
  }

  async findByName(name: string): Promise<Topic | null> {
    const rows = await this.db
      .select()
      .from(topics)
      .where(and(eq(topics.name, name), eq(topics.tenantId, this.tenantId), isNull(topics.deletedAt)))
      .limit(1);

    const [row] = rows;
    return row ? TopicReadonlyRepository.toDomain(row) : null;
  }

  static toDomain(row: TopicRow): Topic {
    const entity = new Topic({
      key:       new EntityKey(row.id, row.tenantId),
      name:      row.name,
      config:    row.config as TopicConfig,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
    entity.deletedAt = row.deletedAt ?? null;
    return entity;
  }
}
