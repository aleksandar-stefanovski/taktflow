import { BaseEntity } from './base-entity.js';
import type { HasTenant } from '../interfaces/has-tenant.interface.js';
import type { HasSoftDelete } from '../interfaces/has-soft-delete.interface.js';

export type ScheduleStatus = 'active' | 'paused';

export class Schedule extends BaseEntity implements HasTenant, HasSoftDelete {
  readonly tenantId:    string;
  readonly topicId:     string;
  readonly cron:        string;
  payload:              Record<string, unknown>;
  readonly environment: string;
  status:    ScheduleStatus;
  lastRun:   Date | null;
  nextRun:   Date | null;
  deletedAt: Date | null = null;

  constructor(props: {
    tenantId:    string;
    topicId:     string;
    cron:        string;
    environment: string;
    payload?:    Record<string, unknown>;
    status?:     ScheduleStatus;
    lastRun?:    Date | null;
    nextRun?:    Date | null;
    id?:         string;
    createdAt?:  Date;
    updatedAt?:  Date;
  }) {
    super(props.id, props.createdAt, props.updatedAt);
    this.tenantId    = props.tenantId;
    this.topicId     = props.topicId;
    this.cron        = props.cron;
    this.environment = props.environment;
    this.payload     = props.payload ?? {};
    this.status      = props.status ?? 'active';
    this.lastRun     = props.lastRun ?? null;
    this.nextRun     = props.nextRun ?? null;
  }
}
