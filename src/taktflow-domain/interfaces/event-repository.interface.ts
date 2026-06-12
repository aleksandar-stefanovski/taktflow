import type { Event } from '@domain/entities/event.js';
import type { IEventReadRepository } from './readonly/event-read-repository.interface.js';
import type { IEntityBaseRepository } from './entity-base-repository.interface.js';

export interface IEventRepository
  extends IEventReadRepository,
    IEntityBaseRepository<Event> {}
