import type { Event } from '@domain/entities/event.js';
import type { IEntityBaseReadonlyRepository } from './entity-base-readonly-repository.interface.js';

export interface IEventReadRepository extends IEntityBaseReadonlyRepository<Event> {
  findByTopicId(topicId: string, limit: number, offset: number): Promise<Event[]>;
  countByTopicId(topicId: string): Promise<number>;
  findByIdempotencyKey(key: string): Promise<Event | null>;
  countThisMonth(): Promise<number>;
}
