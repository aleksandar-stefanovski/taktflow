import type { IEventRepository }      from '@taktflow/domain/interfaces/event-repository.interface.js';
import type { ITenantRootRepository }  from '@taktflow/domain/interfaces/tenant-root-repository.interface.js';
import { PlanLimitException }          from '@taktflow/domain/exceptions/plan-limit-exception.js';
import { NotFoundException }           from '@taktflow/domain/exceptions/not-found-exception.js';
import type { IUsageService }          from '@application/interfaces/usage-service.interface.js';

export class UsageService implements IUsageService {
  constructor(
    private readonly events:             IEventRepository,
    private readonly tenants:            ITenantRootRepository,
    private readonly planEventsLimit:    Record<string, number>,
    private readonly planPayloadLimits:  Record<string, number>,
  ) {}

  async getMonthlyCount(tenantId: string): Promise<number> {
    return this.events.countThisMonth();
  }

  async getPlanLimit(tenantId: string): Promise<number> {
    const tenant = await this.tenants.findById(tenantId);
    if (!tenant) throw new NotFoundException('Tenant', tenantId);
    return this.planEventsLimit[tenant.plan] ?? 0;
  }

  async getPayloadLimit(tenantId: string): Promise<number> {
    const tenant = await this.tenants.findById(tenantId);
    if (!tenant) throw new NotFoundException('Tenant', tenantId);
    return tenant.maxPayloadBytesOverride ?? this.planPayloadLimits[tenant.plan] ?? 0;
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
