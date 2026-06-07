import type { Schedule, ScheduleStatus } from '@domain/entities/schedule.js';

export class CreateScheduleResponse {
  readonly id:          string;
  readonly topicId:     string;
  readonly cron:        string;
  readonly payload:     Record<string, unknown>;
  readonly environment: string;
  readonly status:      ScheduleStatus;
  readonly nextRun:     string | null;
  readonly createdAt:   string;

  constructor(schedule: Schedule) {
    this.id          = schedule.id;
    this.topicId     = schedule.topicId;
    this.cron        = schedule.cron;
    this.payload     = schedule.payload;
    this.environment = schedule.environment;
    this.status      = schedule.status;
    this.nextRun     = schedule.nextRun?.toISOString() ?? null;
    this.createdAt   = schedule.createdAt.toISOString();
  }

  static mapFromEntity(schedule: Schedule): CreateScheduleResponse {
    return new CreateScheduleResponse(schedule);
  }
}
