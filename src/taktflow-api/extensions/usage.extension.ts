import { plansConfig } from '@api/config/plans.config.js';

import type { IEventRepository }      from '@domain/interfaces/event-repository.interface.js';
import type { ITenantRootRepository } from '@domain/interfaces/tenant-root-repository.interface.js';

import { UsageService }       from '@application/services/usage.service.js';
import type { IUsageService } from '@application/interfaces/usage-service.interface.js';

export function buildUsageService(
  events: IEventRepository,
  tenants: ITenantRootRepository,
): IUsageService {
  return new UsageService(
    events,
    tenants,
    {
      starter:    plansConfig.PLAN_STARTER_EVENTS_PER_MONTH,
      growth:     plansConfig.PLAN_GROWTH_EVENTS_PER_MONTH,
      business:   plansConfig.PLAN_BUSINESS_EVENTS_PER_MONTH,
      enterprise: plansConfig.PLAN_ENTERPRISE_EVENTS_PER_MONTH,
    },
  );
}
