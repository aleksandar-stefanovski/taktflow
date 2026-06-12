import type { Topic } from '@domain/entities/topic.js';
import type { IEntityBaseReadonlyRepository } from './entity-base-readonly-repository.interface.js';

export interface ITopicReadRepository extends IEntityBaseReadonlyRepository<Topic> {
  findByName(name: string): Promise<Topic | null>;
}
