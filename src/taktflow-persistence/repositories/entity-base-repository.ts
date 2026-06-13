import { and, eq } from 'drizzle-orm';

import type { EntityBase } from '@taktflow/domain/entities/entity-base.js';
import { EntityBaseReadonlyRepository } from './readonly/entity-base-readonly-repository.js';

export abstract class EntityBaseRepository<T extends EntityBase>
  extends EntityBaseReadonlyRepository<T> {

  abstract create(entity: T): Promise<T>;
  abstract update(id: string, updates: Partial<T>): Promise<T>;

  async delete(id: string): Promise<void> {
    await this.db
      .update(this.table)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(this.table['id']!, id), eq(this.table['tenantId']!, this.tenantId)));
  }
}
