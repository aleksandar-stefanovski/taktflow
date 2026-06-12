import type { Consumer } from '@domain/entities/consumer.js';
import type { IEntityBaseReadonlyRepository } from './entity-base-readonly-repository.interface.js';

export interface IConsumerReadRepository extends IEntityBaseReadonlyRepository<Consumer> {
  findByTopicId(topicId: string, limit: number, offset: number): Promise<Consumer[]>;
  countByTopicId(topicId: string): Promise<number>;
}
