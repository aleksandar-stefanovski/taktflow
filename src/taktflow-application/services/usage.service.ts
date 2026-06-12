import type { IEventRepository } from '@domain/interfaces/event-repository.interface.js';
import type { ITenantRootRepository } from '@domain/interfaces/tenant-root-repository.interface.js';
import { PlanLimitException } from '@domain/exceptions/plan-limit-exception.js';
import { NotFoundException } from '@domain/exceptions/not-found-exception.js';

import type { IUsageService } from '../interfaces/usage-service.interface.js';

export class UsageService implements IUsageService {
  constructor(
    private readonly events:           IEventRepository,
    private readonly tenants:          ITenantRootRepository,
    private readonly planEventsLimit:  Record<string, number>,
  ) {}

  async getMonthlyCount(tenantId: string): Promise<number> {
    return this.events.countThisMonth();
  }

  async getPlanLimit(tenantId: string): Promise<number> {
    const tenant = await this.tenants.findById(tenantId);
    if (!tenant) throw new NotFoundException('Tenant', tenantId);
    return this.planEventsLimit[tenant.plan] ?? 0;
  }

  async assertWithinLimit(tenantId: string, incoming: number): Promise<void> {
    const [current, limit] = await Promise.all([
      this.getMonthlyCount(tenantId),
      this.getPlanLimit(tenantId),
    ]);

    if (current + incoming > limit) {
      throw new PlanLimitException('events', limit);
    }
  }
}
