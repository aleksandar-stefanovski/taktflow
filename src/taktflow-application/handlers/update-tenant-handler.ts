import type { ITenantRootRepository } from '@domain/interfaces/tenant-root-repository.interface.js';
import type { Tenant } from '@domain/entities/tenant.js';
import { NotFoundException } from '@domain/exceptions/not-found-exception.js';

export interface UpdateTenantCommand {
  tenantId: string;
  name?: string;
}

export class UpdateTenantHandler {
  constructor(private readonly tenants: ITenantRootRepository) {}

  async handle(command: UpdateTenantCommand): Promise<Tenant> {
    const existing = await this.tenants.findById(command.tenantId);
    if (!existing) throw new NotFoundException('Tenant', command.tenantId);

    return this.tenants.update(command.tenantId, { name: command.name });
  }
}
