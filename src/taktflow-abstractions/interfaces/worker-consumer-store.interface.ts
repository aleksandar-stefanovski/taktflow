import type { Consumer } from '@domain/entities/consumer.js';

export interface IWorkerConsumerStore {
  findById(id: string): Promise<Consumer | null>;
  findByTopicId(topicId: string, limit: number, offset: number): Promise<Consumer[]>;
}
