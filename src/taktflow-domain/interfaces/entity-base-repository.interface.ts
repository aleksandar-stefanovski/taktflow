import type { EntityBase } from '@domain/entities/entity-base.js';

export interface IEntityBaseRepository<T extends EntityBase> {
  create(entity: T): Promise<T>;
  update(id: string, updates: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}
