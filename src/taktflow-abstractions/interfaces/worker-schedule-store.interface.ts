import type { Schedule } from '@domain/entities/schedule.js';

export interface IWorkerScheduleStore {
  findDue(now: Date, limit: number): Promise<Schedule[]>;
  update(id: string, updates: Partial<Schedule>): Promise<Schedule>;
}
