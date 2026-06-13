import { and, asc, eq, isNull, lte } from 'drizzle-orm';

import type { DrizzleDb } from '../database.js';
import { schedules } from '../schema/schedules.js';
import type { ScheduleRow } from '../schema/schedules.js';
import { Schedule } from '@taktflow/domain/entities/schedule.js';
import type { IScheduleRepository } from '@taktflow/domain/interfaces/schedule-repository.interface.js';
import type { ICurrentTenantProvider } from '@taktflow/domain/interfaces/current-tenant-provider.interface.js';
import { ScheduleReadonlyRepository } from './readonly/schedule-readonly-repository.js';
import { EntityBaseRepository } from './entity-base-repository.js';

export class ScheduleRepository
  extends EntityBaseRepository<Schedule>
  implements IScheduleRepository {

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

  async create(entity: Schedule): Promise<Schedule> {
    const rows = await this.db
      .insert(schedules)
      .values({
        id:          entity.id,
        tenantId:    entity.key.tenantId!,
        topicId:     entity.topicId,
        cron:        entity.cron,
        payload:     entity.payload,
        environment: entity.environment,
        status:      entity.status,
        lastRun:     entity.lastRun,
        nextRun:     entity.nextRun,
        createdAt:   entity.createdAt,
        updatedAt:   entity.updatedAt,
      })
      .returning();

    const [row] = rows;
    if (!row) throw new Error('Insert returned no rows');
    return ScheduleReadonlyRepository.toDomain(row);
  }

  async update(id: string, updates: Partial<Schedule>): Promise<Schedule> {
    const rows = await this.db
      .update(schedules)
      .set({
        ...(updates.payload !== undefined && { payload: updates.payload }),
        ...(updates.status !== undefined && { status: updates.status }),
        ...(updates.lastRun !== undefined && { lastRun: updates.lastRun }),
        ...(updates.nextRun !== undefined && { nextRun: updates.nextRun }),
        updatedAt: new Date(),
      })
      .where(and(eq(schedules.id, id), eq(schedules.tenantId, this.tenantId)))
      .returning();

    const [row] = rows;
    if (!row) throw new Error('Update returned no rows');
    return ScheduleReadonlyRepository.toDomain(row);
  }
}
