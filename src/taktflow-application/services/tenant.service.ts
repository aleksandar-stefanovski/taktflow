import type { ITenantRootRepository } from '@taktflow/domain/interfaces/tenant-root-repository.interface.js';
import type { Tenant } from '@taktflow/domain/entities/tenant.js';
import { NotFoundException } from '@taktflow/domain/exceptions/not-found-exception.js';

import type { IUsageService }   from '@application/interfaces/usage-service.interface.js';
import type { ITenantService }  from '../interfaces/tenant-service.interface.js';

export class TenantService implements ITenantService {
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

  async delete(tenantId: string): Promise<void> {
    const tenant = await this.tenants.findById(tenantId);
    if (!tenant) throw new NotFoundException('Tenant', tenantId);
    await this.tenants.softDelete(tenantId);
  }

  async getUsage(tenantId: string): Promise<{ count: number; limit: number }> {
    const [count, limit] = await Promise.all([
      this.usage.getMonthlyCount(tenantId),
      this.usage.getPlanLimit(tenantId),
    ]);

    return { count, limit };
  }
}
