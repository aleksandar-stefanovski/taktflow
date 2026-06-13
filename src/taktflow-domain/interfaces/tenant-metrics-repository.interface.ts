import type { TenantMetrics } from '@domain/entities/tenant-metrics.js';

export interface ITenantMetricsRepository {
  findByTenantId(tenantId: string): Promise<TenantMetrics | null>;
  upsert(metrics: TenantMetrics): Promise<void>;
  incrementSuccess(tenantId: string, processingMs: number): Promise<void>;
  incrementSuccessBatch(tenantId: string, successCount: number, totalProcessingMs: number): Promise<void>;
  incrementFailure(tenantId: string): Promise<void>;
  incrementFailureBatch(tenantId: string, failureCount: number): Promise<void>;
  resetDailyCount(tenantId: string): Promise<void>;
}
