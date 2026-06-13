import type { TenantMetrics } from '@domain/entities/tenant-metrics.js';

export interface IDashboardService {
  getMetrics(tenantId: string): Promise<TenantMetrics>;
}
