import type { TenantMetrics } from '@taktflow/domain/entities/tenant-metrics.js';

export interface IDashboardService {
  getMetrics(tenantId: string): Promise<TenantMetrics>;
}
