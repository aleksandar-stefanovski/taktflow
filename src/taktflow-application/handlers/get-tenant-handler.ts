import type { ITenantRootRepository } from '@domain/interfaces/tenant-root-repository.interface.js';
import type { Tenant } from '@domain/entities/tenant.js';
import { NotFoundException } from '@domain/exceptions/not-found-exception.js';

export class GetTenantHandler {
  constructor(private readonly tenants: ITenantRootRepository) {}

  async handle(tenantId: string): Promise<Tenant> {
    const tenant = await this.tenants.findById(tenantId);
    if (!tenant) throw new NotFoundException('Tenant', tenantId);
    return tenant;
  }
}
