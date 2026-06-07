import type { Tenant, PlanTier } from '@domain/entities/tenant.js';

export class TenantResponse {
  readonly id:        string;
  readonly name:      string;
  readonly plan:      PlanTier;
  readonly createdAt: string;
  readonly updatedAt: string;

  constructor(tenant: Tenant) {
    this.id        = tenant.id;
    this.name      = tenant.name;
    this.plan      = tenant.plan;
    this.createdAt = tenant.createdAt.toISOString();
    this.updatedAt = tenant.updatedAt.toISOString();
  }
}
