import { EntityBase } from './entity-base.js';
import { EntityKey } from './entity-key.js';
import type { HasSoftDelete } from './has-soft-delete.interface.js';

export type ScheduleStatus = 'active' | 'paused';

export class Schedule extends EntityBase implements HasSoftDelete {
  readonly topicId:     string;
  readonly cron:        string;
  payload:              Record<string, unknown>;
  readonly environment: string;
  status:               ScheduleStatus;
  lastRun:              Date | null;
  nextRun:              Date | null;
  deletedAt:            Date | null = null;

  constructor(props: {
    key:         EntityKey;
    topicId:     string;
    cron:        string;
    environment: string;
    payload?:    Record<string, unknown>;
    status?:     ScheduleStatus;
    lastRun?:    Date | null;
    nextRun?:    Date | null;
    createdAt?:  Date;
    updatedAt?:  Date;
  }) {
    super(props.key, props.createdAt, props.updatedAt);
    this.topicId     = props.topicId;
    this.cron        = props.cron;
    this.environment = props.environment;
    this.payload     = props.payload ?? {};
    this.status      = props.status ?? 'active';
    this.lastRun     = props.lastRun ?? null;
    this.nextRun     = props.nextRun ?? null;
  }
}
