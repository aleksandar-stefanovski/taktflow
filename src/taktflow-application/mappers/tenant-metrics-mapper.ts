import type { TenantMetrics } from '@domain/entities/tenant-metrics.js';

import { DashboardMetricsResponse } from '../responses/metrics/dashboard-metrics.response.js';

export class TenantMetricsMapper {
  static toDashboardResponse(metrics: TenantMetrics): DashboardMetricsResponse {
    return new DashboardMetricsResponse(metrics);
  }
}
