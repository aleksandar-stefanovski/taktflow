import type { Schedule } from '../entities/schedule.js';
import type { ITenantRepository } from './tenant-repository.interface.js';

export interface IScheduleRepository extends ITenantRepository<Schedule> {
  findActive(tenantId: string): Promise<Schedule[]>;
  findDue(now: Date, limit: number): Promise<Schedule[]>;
}
