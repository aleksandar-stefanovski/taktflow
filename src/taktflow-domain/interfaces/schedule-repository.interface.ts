import type { Schedule } from '@domain/entities/schedule.js';
import type { IScheduleReadRepository } from './readonly/schedule-read-repository.interface.js';
import type { IEntityBaseRepository } from './entity-base-repository.interface.js';

export interface IScheduleRepository
  extends IScheduleReadRepository,
    IEntityBaseRepository<Schedule> {}
