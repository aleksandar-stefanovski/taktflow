import type { DeadLetterEvent } from '@domain/entities/dead-letter-event.js';
import type { IDeadLetterReadRepository } from './readonly/dead-letter-read-repository.interface.js';
import type { IEntityBaseRepository } from './entity-base-repository.interface.js';

export interface IDeadLetterEventRepository
  extends IDeadLetterReadRepository,
    IEntityBaseRepository<DeadLetterEvent> {}
