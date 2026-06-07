import { and, eq, asc, lte, isNull } from 'drizzle-orm';
import type { PgTableWithColumns, TableConfig } from 'drizzle-orm/pg-core';

import type { DrizzleDb } from '../database.js';
import { schedules } from '../schema/schedules.js';
import type { ScheduleRow } from '../schema/schedules.js';
import { Schedule } from '@domain/entities/schedule.js';
import type { ScheduleStatus } from '@domain/entities/schedule.js';
import type { IScheduleRepository } from '@domain/interfaces/schedule-repository.interface.js';
import { BaseTenantRepository } from './base-tenant-repository.js';

export class ScheduleRepository
  extends BaseTenantRepository<Schedule>
  implements IScheduleRepository {

  constructor(db: DrizzleDb) {
    super(db);
  }

  protected get table(): PgTableWithColumns<TableConfig> {
    return schedules as unknown as PgTableWithColumns<TableConfig>;
  }

  protected mapToDomain(row: Record<string, unknown>): Schedule {
    return ScheduleRepository.toDomain(row as ScheduleRow);
  }

  async create(entity: Schedule): Promise<Schedule> {
    const rows = await this.db
      .insert(schedules)
      .values({
        id:          entity.id,
        tenantId:    entity.tenantId,
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
    return ScheduleRepository.toDomain(row);
  }

  async update(id: string, tenantId: string, updates: Partial<Schedule>): Promise<Schedule> {
    const rows = await this.db
      .update(schedules)
      .set({
        ...(updates.payload !== undefined && { payload: updates.payload }),
        ...(updates.status !== undefined && { status: updates.status }),
        ...(updates.lastRun !== undefined && { lastRun: updates.lastRun }),
        ...(updates.nextRun !== undefined && { nextRun: updates.nextRun }),
        updatedAt: new Date(),
      })
      .where(and(eq(schedules.id, id), eq(schedules.tenantId, tenantId)))
      .returning();

    const [row] = rows;
    if (!row) throw new Error('Update returned no rows');
    return ScheduleRepository.toDomain(row);
  }

  async findActive(tenantId: string): Promise<Schedule[]> {
    const rows = await this.db
      .select()
      .from(schedules)
      .where(and(
        eq(schedules.tenantId, tenantId),
        eq(schedules.status, 'active'),
        isNull(schedules.deletedAt),
      ));

    return rows.map(ScheduleRepository.toDomain);
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

    return rows.map(ScheduleRepository.toDomain);
  }

  static toDomain(row: ScheduleRow): Schedule {
    const entity = new Schedule({
      id:          row.id,
      tenantId:    row.tenantId,
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
