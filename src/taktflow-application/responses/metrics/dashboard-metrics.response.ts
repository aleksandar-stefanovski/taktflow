import type { TenantMetrics } from '@domain/entities/tenant-metrics.js';

export class DashboardMetricsResponse {
  readonly tenantId:             string;
  readonly eventsToday:          number;
  readonly eventsTotal:          number;
  readonly successCount:         number;
  readonly failureCount:         number;
  readonly averageProcessingMs:  number;
  readonly updatedAt:            string;

  constructor(metrics: TenantMetrics) {
    this.tenantId            = metrics.tenantId;
    this.eventsToday         = metrics.eventsToday;
    this.eventsTotal         = metrics.eventsTotal;
    this.successCount        = metrics.successCount;
    this.failureCount        = metrics.failureCount;
    const deliveryCount      = metrics.successCount + metrics.failureCount;
    this.averageProcessingMs = deliveryCount > 0
      ? metrics.totalProcessingMs / deliveryCount
      : 0;
    this.updatedAt           = metrics.updatedAt.toISOString();
  }

  static mapFromEntity(metrics: TenantMetrics): DashboardMetricsResponse {
    return new DashboardMetricsResponse(metrics);
  }
}
