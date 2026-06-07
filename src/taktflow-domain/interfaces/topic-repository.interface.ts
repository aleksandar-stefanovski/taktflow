import type { Topic } from '../entities/topic.js';
import type { ITenantRepository } from './tenant-repository.interface.js';

export interface ITopicRepository extends ITenantRepository<Topic> {
  findByName(name: string, tenantId: string): Promise<Topic | null>;
}
