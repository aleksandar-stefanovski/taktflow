import type { Schedule, ScheduleStatus } from '@domain/entities/schedule.js';

import { PaginatedResult } from '../paginated-result.js';

export class ScheduleSummaryResponse {
  readonly id:          string;
  readonly topicId:     string;
  readonly cron:        string;
  readonly environment: string;
  readonly status:      ScheduleStatus;
  readonly lastRun:     string | null;
  readonly nextRun:     string | null;
  readonly createdAt:   string;

  constructor(schedule: Schedule) {
    this.id          = schedule.id;
    this.topicId     = schedule.topicId;
    this.cron        = schedule.cron;
    this.environment = schedule.environment;
    this.status      = schedule.status;
    this.lastRun     = schedule.lastRun?.toISOString() ?? null;
    this.nextRun     = schedule.nextRun?.toISOString() ?? null;
    this.createdAt   = schedule.createdAt.toISOString();
  }
}

export class ListSchedulesResponse {
  readonly items:       ScheduleSummaryResponse[];
  readonly totalCount:  number;
  readonly totalPages:  number;
  readonly currentPage: number;
  readonly pageSize:    number;

  constructor(result: PaginatedResult<Schedule>) {
    this.items       = result.items.map((schedule) => new ScheduleSummaryResponse(schedule));
    this.totalCount  = result.totalCount;
    this.totalPages  = result.totalPages;
    this.currentPage = result.currentPage;
    this.pageSize    = result.pageSize;
  }
}
