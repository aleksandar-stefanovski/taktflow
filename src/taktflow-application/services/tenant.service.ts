import type { ITenantRootRepository } from '@domain/interfaces/tenant-root-repository.interface.js';
import type { Tenant } from '@domain/entities/tenant.js';
import { NotFoundException } from '@domain/exceptions/not-found-exception.js';

import type { IUsageService } from '../interfaces/usage-service.interface.js';
import type { IUsageResult } from '../interfaces/usage-result.interface.js';

export class TenantService {
  constructor(
    private readonly tenants: ITenantRootRepository,
    private readonly usage:   IUsageService,
  ) {}

  async getById(tenantId: string): Promise<Tenant> {
    const tenant = await this.tenants.findById(tenantId);
    if (!tenant) throw new NotFoundException('Tenant', tenantId);
    return tenant;
  }

  async update(command: { tenantId: string; name?: string }): Promise<Tenant> {
    const existing = await this.tenants.findById(command.tenantId);
    if (!existing) throw new NotFoundException('Tenant', command.tenantId);
    return this.tenants.update(command.tenantId, { name: command.name });
  }

  async getUsage(tenantId: string): Promise<IUsageResult> {
    const [count, limit] = await Promise.all([
      this.usage.getMonthlyCount(tenantId),
      this.usage.getPlanLimit(tenantId),
    ]);

    const percentage = limit > 0 ? Math.round((count / limit) * 100) : 0;
    return { count, limit, percentage };
  }
}
