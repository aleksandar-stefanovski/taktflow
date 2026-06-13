import type { Schedule, ScheduleStatus } from '@taktflow/domain/entities/schedule.js';

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

  static mapFromEntity(schedule: Schedule): ScheduleSummaryResponse {
    return new ScheduleSummaryResponse(schedule);
  }
}
