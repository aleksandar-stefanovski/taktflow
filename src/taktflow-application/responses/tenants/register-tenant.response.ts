import type { Tenant, PlanTier } from '@domain/entities/tenant.js';

export class RegisterTenantResponse {
  readonly id:        string;
  readonly name:      string;
  readonly plan:      PlanTier;
  readonly createdAt: string;

  constructor(tenant: Tenant) {
    this.id        = tenant.id;
    this.name      = tenant.name;
    this.plan      = tenant.plan;
    this.createdAt = tenant.createdAt.toISOString();
  }
}
