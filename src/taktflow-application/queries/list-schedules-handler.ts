import type { Schedule } from '@domain/entities/schedule.js';
import type { IScheduleRepository } from '@domain/interfaces/schedule-repository.interface.js';

import type { PaginationQuery } from '../requests/pagination.request.js';
import { PaginatedResult } from '../responses/paginated-result.js';

export class ListSchedulesHandler {
  constructor(private readonly schedules: IScheduleRepository) {}

  async handle(query: PaginationQuery & { tenantId: string }): Promise<PaginatedResult<Schedule>> {
    const options = { page: query.page, pageSize: query.pageSize };
    const data    = await this.schedules.findAll(query.tenantId, options);
    return new PaginatedResult(data, options);
  }
}
