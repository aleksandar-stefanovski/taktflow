import { and, eq, isNull } from 'drizzle-orm';

import type { DrizzleDb } from '../database.js';
import { topics } from '../schema/topics.js';
import type { TopicRow } from '../schema/topics.js';
import { Topic } from '@taktflow/domain/entities/topic.js';
import type { ITopicRepository } from '@taktflow/domain/interfaces/topic-repository.interface.js';
import type { ICurrentTenantProvider } from '@taktflow/domain/interfaces/current-tenant-provider.interface.js';
import { TopicReadonlyRepository } from './readonly/topic-readonly-repository.js';
import { EntityBaseRepository } from './entity-base-repository.js';

export class TopicRepository
  extends EntityBaseRepository<Topic>
  implements ITopicRepository {

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

  async create(entity: Topic): Promise<Topic> {
    const rows = await this.db
      .insert(topics)
      .values({
        id:        entity.id,
        tenantId:  entity.key.tenantId!,
        name:      entity.name,
        config:    entity.config,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      })
      .returning();

    const [row] = rows;
    if (!row) throw new Error('Insert returned no rows');
    return TopicReadonlyRepository.toDomain(row);
  }

  async update(id: string, updates: Partial<Topic>): Promise<Topic> {
    const rows = await this.db
      .update(topics)
      .set({
        ...(updates.name !== undefined && { name: updates.name }),
        ...(updates.config !== undefined && { config: updates.config }),
        updatedAt: new Date(),
      })
      .where(and(eq(topics.id, id), eq(topics.tenantId, this.tenantId)))
      .returning();

    const [row] = rows;
    if (!row) throw new Error('Update returned no rows');
    return TopicReadonlyRepository.toDomain(row);
  }
}
