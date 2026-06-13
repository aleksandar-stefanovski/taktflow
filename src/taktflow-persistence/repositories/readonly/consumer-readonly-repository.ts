import { and, count, eq, isNull } from 'drizzle-orm';
import { firstCount } from '../../query.helper.js';

import type { DrizzleDb } from '../../database.js';
import { consumers } from '../../schema/consumers.js';
import type { ConsumerRow } from '../../schema/consumers.js';
import { Consumer } from '@domain/entities/consumer.js';
import type { ConsumerType, ConsumerStatus } from '@domain/entities/consumer.js';
import { EntityKey } from '@domain/entities/entity-key.js';
import type { ICurrentTenantProvider } from '@domain/interfaces/current-tenant-provider.interface.js';
import { EntityBaseReadonlyRepository } from './entity-base-readonly-repository.js';

export class ConsumerReadonlyRepository extends EntityBaseReadonlyRepository<Consumer> {
  constructor(db: DrizzleDb, tenantProvider: ICurrentTenantProvider) {
    super(db, consumers, tenantProvider);
  }

  protected mapToDomain(row: Record<string, unknown>): Consumer {
    return ConsumerReadonlyRepository.toDomain(row as ConsumerRow);
  }

  async findByTopicId(topicId: string, limit: number, offset: number): Promise<Consumer[]> {
    const rows = await this.db
      .select()
      .from(consumers)
      .where(and(
        eq(consumers.topicId, topicId),
        eq(consumers.tenantId, this.tenantId),
        isNull(consumers.deletedAt),
      ))
      .limit(limit)
      .offset(offset);

    return rows.map(ConsumerReadonlyRepository.toDomain);
  }

  async countByTopicId(topicId: string): Promise<number> {
    const result = await this.db
      .select({ total: count() })
      .from(consumers)
      .where(and(
        eq(consumers.topicId, topicId),
        eq(consumers.tenantId, this.tenantId),
        isNull(consumers.deletedAt),
      ));

    return firstCount(result);
  }

  static toDomain(row: ConsumerRow): Consumer {
    const entity = new Consumer({
      key:         EntityKey.reconstitute(row.id, row.tenantId),
      topicId:     row.topicId,
      name:        row.name,
      type:        row.type as ConsumerType,
      url:         row.url ?? null,
      secret:      row.secret,
      environment: row.environment,
      status:      row.status as ConsumerStatus,
      createdAt:   row.createdAt,
      updatedAt:   row.updatedAt,
    });
    entity.deletedAt = row.deletedAt ?? null;
    return entity;
  }
}
