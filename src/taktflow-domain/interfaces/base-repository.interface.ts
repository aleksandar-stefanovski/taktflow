import type { BaseEntity } from '../entities/base-entity.js';
import type { IReadRepository } from './read-repository.interface.js';
import type { IWriteRepository } from './write-repository.interface.js';

export interface IRepository<T extends BaseEntity>
  extends IReadRepository<T>,
    IWriteRepository<T> {}
