import { eq, sql } from 'drizzle-orm';

import type { DrizzleDb } from '../database.js';
import { projectMetrics } from '../schema/project-metrics.js';
import type { ProjectMetricsRow } from '../schema/project-metrics.js';
import { TenantMetrics } from '@domain/entities/tenant-metrics.js';
import type { ITenantMetricsRepository } from '@domain/interfaces/tenant-metrics-repository.interface.js';

export class TenantMetricsRepository implements ITenantMetricsRepository {
  constructor(private readonly db: DrizzleDb) {}

  async findByTenantId(tenantId: string): Promise<TenantMetrics | null> {
    const rows = await this.db
      .select()
      .from(projectMetrics)
      .where(eq(projectMetrics.tenantId, tenantId))
      .limit(1);

    const [row] = rows;
    return row ? TenantMetricsRepository.toDomain(row) : null;
  }

  async upsert(metrics: TenantMetrics): Promise<void> {
    await this.db
      .insert(projectMetrics)
      .values({
        tenantId:          metrics.tenantId,
        eventsToday:       metrics.eventsToday,
        eventsTotal:       metrics.eventsTotal,
        successCount:      metrics.successCount,
        failureCount:      metrics.failureCount,
        totalProcessingMs: metrics.totalProcessingMs,
        updatedAt:         metrics.updatedAt,
      })
      .onConflictDoUpdate({
        target: projectMetrics.tenantId,
        set: {
          eventsToday:       metrics.eventsToday,
          eventsTotal:       metrics.eventsTotal,
          successCount:      metrics.successCount,
          failureCount:      metrics.failureCount,
          totalProcessingMs: metrics.totalProcessingMs,
          updatedAt:         new Date(),
        },
      });
  }

  async incrementSuccess(tenantId: string, processingMs: number): Promise<void> {
    await this.db
      .update(projectMetrics)
      .set({
        successCount:      sql`${projectMetrics.successCount} + 1`,
        eventsToday:       sql`${projectMetrics.eventsToday} + 1`,
        eventsTotal:       sql`${projectMetrics.eventsTotal} + 1`,
        totalProcessingMs: sql`${projectMetrics.totalProcessingMs} + ${processingMs}`,
        updatedAt:         new Date(),
      })
      .where(eq(projectMetrics.tenantId, tenantId));
  }

  async incrementSuccessBatch(tenantId: string, successCount: number, totalProcessingMs: number): Promise<void> {
    await this.db
      .insert(projectMetrics)
      .values({
        tenantId,
        eventsToday:       successCount,
        eventsTotal:       successCount,
        successCount:      successCount,
        failureCount:      0,
        totalProcessingMs,
        updatedAt:         new Date(),
      })
      .onConflictDoUpdate({
        target: projectMetrics.tenantId,
        set: {
          successCount:      sql`${projectMetrics.successCount} + ${successCount}`,
          eventsToday:       sql`${projectMetrics.eventsToday} + ${successCount}`,
          eventsTotal:       sql`${projectMetrics.eventsTotal} + ${successCount}`,
          totalProcessingMs: sql`${projectMetrics.totalProcessingMs} + ${totalProcessingMs}`,
          updatedAt:         new Date(),
        },
      });
  }

  async incrementFailureBatch(tenantId: string, failureCount: number): Promise<void> {
    await this.db
      .insert(projectMetrics)
      .values({
        tenantId,
        eventsToday:       failureCount,
        eventsTotal:       failureCount,
        successCount:      0,
        failureCount:      failureCount,
        totalProcessingMs: 0,
        updatedAt:         new Date(),
      })
      .onConflictDoUpdate({
        target: projectMetrics.tenantId,
        set: {
          failureCount: sql`${projectMetrics.failureCount} + ${failureCount}`,
          eventsToday:  sql`${projectMetrics.eventsToday} + ${failureCount}`,
          eventsTotal:  sql`${projectMetrics.eventsTotal} + ${failureCount}`,
          updatedAt:    new Date(),
        },
      });
  }

  async incrementFailure(tenantId: string): Promise<void> {
    await this.db
      .update(projectMetrics)
      .set({
        failureCount: sql`${projectMetrics.failureCount} + 1`,
        eventsToday:  sql`${projectMetrics.eventsToday} + 1`,
        eventsTotal:  sql`${projectMetrics.eventsTotal} + 1`,
        updatedAt:    new Date(),
      })
      .where(eq(projectMetrics.tenantId, tenantId));
  }

  async resetDailyCount(tenantId: string): Promise<void> {
    await this.db
      .update(projectMetrics)
      .set({
        eventsToday: 0,
        updatedAt:   new Date(),
      })
      .where(eq(projectMetrics.tenantId, tenantId));
  }

  static toDomain(row: ProjectMetricsRow): TenantMetrics {
    return new TenantMetrics({
      tenantId:          row.tenantId,
      eventsToday:       row.eventsToday,
      eventsTotal:       row.eventsTotal,
      successCount:      row.successCount,
      failureCount:      row.failureCount,
      totalProcessingMs: row.totalProcessingMs,
      updatedAt:         row.updatedAt,
    });
  }
}
