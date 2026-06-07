import type { ITenantMetricsRepository } from '@domain/interfaces/tenant-metrics-repository.interface.js';
import type { TenantMetrics } from '@domain/entities/tenant-metrics.js';
import { NotFoundException } from '@domain/exceptions/not-found-exception.js';

export class GetDashboardMetricsHandler {
  constructor(private readonly metrics: ITenantMetricsRepository) {}

  async handle(tenantId: string): Promise<TenantMetrics> {
    const tenantMetrics = await this.metrics.findByTenantId(tenantId);
    if (!tenantMetrics) throw new NotFoundException('TenantMetrics', tenantId);
    return tenantMetrics;
  }
}
