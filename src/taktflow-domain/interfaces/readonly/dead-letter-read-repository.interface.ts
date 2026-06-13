import type { DeadLetterEvent } from '@domain/entities/dead-letter-event.js';
import type { IEntityBaseReadonlyRepository } from './entity-base-readonly-repository.interface.js';

export interface IDeadLetterReadRepository extends IEntityBaseReadonlyRepository<DeadLetterEvent> {
  findUnreplayed(): Promise<DeadLetterEvent[]>;
}
