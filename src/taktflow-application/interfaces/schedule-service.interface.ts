import type { Schedule }              from '@taktflow/domain/entities/schedule.js';
import type { CreateScheduleRequest } from '../requests/schedules/create-schedule.request.js';
import type { PaginationQuery }       from '../requests/pagination.request.js';
import type { PaginatedResponse }       from '../responses/paginated-response.js';

export interface IScheduleService {
  create(request: CreateScheduleRequest & { tenantId: string }): Promise<Schedule>;
  list(query: PaginationQuery & { tenantId: string }): Promise<PaginatedResponse<Schedule>>;
}
