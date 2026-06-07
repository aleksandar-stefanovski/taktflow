import type { BaseEntity } from '../entities/base-entity.js';

export interface IWriteRepository<T extends BaseEntity> {
  create(entity: T): Promise<T>;
  update(id: string, updates: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}
