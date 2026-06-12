import { and, count, eq, isNull } from 'drizzle-orm';

import type { DrizzleDb } from '../database.js';
import { consumers } from '../schema/consumers.js';
import type { ConsumerRow } from '../schema/consumers.js';
import { Consumer } from '@domain/entities/consumer.js';
import type { IConsumerRepository } from '@domain/interfaces/consumer-repository.interface.js';
import type { ICurrentTenantProvider } from '@domain/interfaces/current-tenant-provider.interface.js';
import { ConsumerReadonlyRepository } from './readonly/consumer-readonly-repository.js';
import { EntityBaseRepository } from './entity-base-repository.js';

export class ConsumerRepository
  extends EntityBaseRepository<Consumer>
  implements IConsumerRepository {

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

    return result[0]?.total ?? 0;
  }

  async create(entity: Consumer): Promise<Consumer> {
    const rows = await this.db
      .insert(consumers)
      .values({
        id:                 entity.id,
        tenantId:           entity.key.tenantId!,
        topicId:            entity.topicId,
        name:               entity.name,
        type:               entity.type,
        url:                entity.url,
        secret:             entity.secret,
        environment:        entity.environment,
        status:             entity.status,
        alertEmail:         entity.alertEmail,
        alertAfterFailures: entity.alertAfterFailures,
        createdAt:          entity.createdAt,
        updatedAt:          entity.updatedAt,
      })
      .returning();

    const [row] = rows;
    if (!row) throw new Error('Insert returned no rows');
    return ConsumerReadonlyRepository.toDomain(row);
  }

  async update(id: string, updates: Partial<Consumer>): Promise<Consumer> {
    const rows = await this.db
      .update(consumers)
      .set({
        ...(updates.name !== undefined && { name: updates.name }),
        ...(updates.url !== undefined && { url: updates.url }),
        ...(updates.status !== undefined && { status: updates.status }),
        ...(updates.alertEmail !== undefined && { alertEmail: updates.alertEmail }),
        updatedAt: new Date(),
      })
      .where(and(eq(consumers.id, id), eq(consumers.tenantId, this.tenantId)))
      .returning();

    const [row] = rows;
    if (!row) throw new Error('Update returned no rows');
    return ConsumerReadonlyRepository.toDomain(row);
  }
}
