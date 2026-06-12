import type { EntityBase } from '@domain/entities/entity-base.js';

export interface IEntityBaseReadonlyRepository<T extends EntityBase> {
  findById(id: string): Promise<T | null>;
  findAll(limit: number, offset: number): Promise<T[]>;
  count(): Promise<number>;
  exists(id: string): Promise<boolean>;
}
