import type { Topic } from '@domain/entities/topic.js';
import type { ITopicReadRepository } from './readonly/topic-read-repository.interface.js';
import type { IEntityBaseRepository } from './entity-base-repository.interface.js';

export interface ITopicRepository
  extends ITopicReadRepository,
    IEntityBaseRepository<Topic> {}
