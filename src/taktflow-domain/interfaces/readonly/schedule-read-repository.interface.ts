import type { Schedule } from '@domain/entities/schedule.js';
import type { IEntityBaseReadonlyRepository } from './entity-base-readonly-repository.interface.js';

export interface IScheduleReadRepository extends IEntityBaseReadonlyRepository<Schedule> {
  findActive(): Promise<Schedule[]>;
  findDue(now: Date, limit: number): Promise<Schedule[]>;
}
