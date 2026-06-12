import type { Tenant } from '@domain/entities/tenant.js';

export interface ITenantRootReadRepository {
  findById(id: string): Promise<Tenant | null>;
  findAll(limit: number, offset: number): Promise<Tenant[]>;
  count(): Promise<number>;
}
