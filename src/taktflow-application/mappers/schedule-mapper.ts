import type { Schedule } from '@domain/entities/schedule.js';
import type { PaginatedResult } from '@application/responses/paginated-result.js';

import { CreateScheduleResponse } from '../responses/schedules/create-schedule.response.js';
import { ScheduleSummaryResponse, ListSchedulesResponse } from '../responses/schedules/list-schedules.response.js';

export class ScheduleMapper {
  static toCreateResponse(schedule: Schedule): CreateScheduleResponse {
    return new CreateScheduleResponse(schedule);
  }

  static toSummaryResponse(schedule: Schedule): ScheduleSummaryResponse {
    return new ScheduleSummaryResponse(schedule);
  }

  static toListResponse(result: PaginatedResult<Schedule>): ListSchedulesResponse {
    return new ListSchedulesResponse(result);
  }
}
