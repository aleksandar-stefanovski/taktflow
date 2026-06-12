import type { Consumer } from '@domain/entities/consumer.js';
import type { IConsumerReadRepository } from './readonly/consumer-read-repository.interface.js';
import type { IEntityBaseRepository } from './entity-base-repository.interface.js';

export interface IConsumerRepository
  extends IConsumerReadRepository,
    IEntityBaseRepository<Consumer> {}
