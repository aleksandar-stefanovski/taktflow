import type { Topic } from '@domain/entities/topic.js';

export interface IWorkerTopicStore {
  findById(id: string): Promise<Topic | null>;
}
