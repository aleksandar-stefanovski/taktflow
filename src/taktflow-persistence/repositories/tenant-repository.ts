import { eq, desc, count, isNull, and } from 'drizzle-orm';
import { firstCount } from '../query.helper.js';

import type { DrizzleDb } from '../database.js';
import { tenants } from '../schema/tenants.js';
import type { TenantRow } from '../schema/tenants.js';
import type { Tenant } from '@taktflow/domain/entities/tenant.js';
import type { PlanTier } from '@taktflow/domain/entities/tenant.js';
import { Tenant as TenantEntity } from '@taktflow/domain/entities/tenant.js';
import { EntityKey } from '@taktflow/domain/entities/entity-key.js';
import type { ITenantRootRepository } from '@taktflow/domain/interfaces/tenant-root-repository.interface.js';

export class TenantRepository implements ITenantRootRepository {
  constructor(private readonly db: DrizzleDb) {}

  async findById(id: string): Promise<Tenant | null> {
    const rows = await this.db
      .select()
      .from(tenants)
      .where(and(eq(tenants.id, id), isNull(tenants.deletedAt)))
      .limit(1);

    const [row] = rows;
    return row ? TenantRepository.toDomain(row) : null;
  }

  async findAll(limit: number, offset: number): Promise<Tenant[]> {
    const rows = await this.db
      .select()
      .from(tenants)
      .where(isNull(tenants.deletedAt))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(tenants.createdAt));

    return rows.map(TenantRepository.toDomain);
  }

  async count(): Promise<number> {
    const result = await this.db
      .select({ total: count() })
      .from(tenants)
      .where(isNull(tenants.deletedAt));

    return firstCount(result);
  }

  async create(tenant: Tenant): Promise<Tenant> {
    const rows = await this.db
      .insert(tenants)
      .values({
        id:                      tenant.id,
        name:                    tenant.name,
        plan:                    tenant.plan,
        maxPayloadBytesOverride: tenant.maxPayloadBytesOverride ?? null,
        createdAt:               tenant.createdAt,
        updatedAt:               tenant.updatedAt,
      })
      .returning();

    const [row] = rows;
    if (!row) throw new Error('Insert returned no rows');
    return TenantRepository.toDomain(row);
  }

  async update(id: string, updates: Partial<Tenant>): Promise<Tenant> {
    const rows = await this.db
      .update(tenants)
      .set({
        ...(updates.name !== undefined && { name: updates.name }),
        ...(updates.plan !== undefined && { plan: updates.plan }),
        ...(updates.maxPayloadBytesOverride !== undefined && { maxPayloadBytesOverride: updates.maxPayloadBytesOverride }),
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, id))
      .returning();

    const [row] = rows;
    if (!row) throw new Error('Update returned no rows');
    return TenantRepository.toDomain(row);
  }

  async softDelete(id: string): Promise<void> {
    await this.db
      .update(tenants)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(tenants.id, id));
  }

  async reactivate(id: string): Promise<Tenant> {
    const rows = await this.db
      .update(tenants)
      .set({ deletedAt: null, updatedAt: new Date() })
      .where(eq(tenants.id, id))
      .returning();

    const [row] = rows;
    if (!row) throw new Error('Update returned no rows');
    return TenantRepository.toDomain(row);
  }

  async findByIdIncludingDeleted(id: string): Promise<Tenant | null> {
    const rows = await this.db
      .select()
      .from(tenants)
      .where(eq(tenants.id, id))
      .limit(1);

    const [row] = rows;
    return row ? TenantRepository.toDomain(row) : null;
  }

  static toDomain(row: TenantRow): Tenant {
    const entity = new TenantEntity({
      key:                     EntityKey.reconstitute(row.id, null),
      name:                    row.name,
      plan:                    row.plan as PlanTier,
      maxPayloadBytesOverride: row.maxPayloadBytesOverride ?? null,
      createdAt:               row.createdAt,
      updatedAt:               row.updatedAt,
    });
    entity.deletedAt = row.deletedAt ?? null;
    return entity;
  }
}
