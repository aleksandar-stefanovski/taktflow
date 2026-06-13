import type { ITenantMetricsRepository } from '@domain/interfaces/tenant-metrics-repository.interface.js';
import type { TenantMetrics }            from '@domain/entities/tenant-metrics.js';
import { NotFoundException }             from '@domain/exceptions/not-found-exception.js';
import type { IDashboardService }        from '../interfaces/dashboard-service.interface.js';

export class DashboardService implements IDashboardService {
  constructor(private readonly metrics: ITenantMetricsRepository) {}

  async getMetrics(tenantId: string): Promise<TenantMetrics> {
    const tenantMetrics = await this.metrics.findByTenantId(tenantId);
    if (!tenantMetrics) throw new NotFoundException('TenantMetrics', tenantId);
    return tenantMetrics;
  }
}
