import { and, asc, eq, isNull, lte } from 'drizzle-orm';

import type { DrizzleDb } from '../../database.js';
import { schedules } from '../../schema/schedules.js';
import type { ScheduleRow } from '../../schema/schedules.js';
import { Schedule } from '@domain/entities/schedule.js';
import type { ScheduleStatus } from '@domain/entities/schedule.js';
import { EntityKey } from '@domain/entities/entity-key.js';
import type { ICurrentTenantProvider } from '@domain/interfaces/current-tenant-provider.interface.js';
import { EntityBaseReadonlyRepository } from './entity-base-readonly-repository.js';

export class ScheduleReadonlyRepository extends EntityBaseReadonlyRepository<Schedule> {
  constructor(db: DrizzleDb, tenantProvider: ICurrentTenantProvider) {
    super(db, schedules, tenantProvider);
  }

  protected mapToDomain(row: Record<string, unknown>): Schedule {
    return ScheduleReadonlyRepository.toDomain(row as ScheduleRow);
  }

  async findActive(): Promise<Schedule[]> {
    const rows = await this.db
      .select()
      .from(schedules)
      .where(and(
        eq(schedules.tenantId, this.tenantId),
        eq(schedules.status, 'active'),
        isNull(schedules.deletedAt),
      ));

    return rows.map(ScheduleReadonlyRepository.toDomain);
  }

  async findDue(now: Date, limit: number): Promise<Schedule[]> {
    const rows = await this.db
      .select()
      .from(schedules)
      .where(and(
        eq(schedules.status, 'active'),
        lte(schedules.nextRun, now),
        isNull(schedules.deletedAt),
      ))
      .orderBy(asc(schedules.nextRun))
      .limit(limit);

    return rows.map(ScheduleReadonlyRepository.toDomain);
  }

  static toDomain(row: ScheduleRow): Schedule {
    const entity = new Schedule({
      key:         EntityKey.reconstitute(row.id, row.tenantId),
      topicId:     row.topicId,
      cron:        row.cron,
      payload:     row.payload as Record<string, unknown>,
      environment: row.environment,
      status:      row.status as ScheduleStatus,
      lastRun:     row.lastRun ?? null,
      nextRun:     row.nextRun ?? null,
      createdAt:   row.createdAt,
      updatedAt:   row.updatedAt,
    });
    entity.deletedAt = row.deletedAt ?? null;
    return entity;
  }
}
