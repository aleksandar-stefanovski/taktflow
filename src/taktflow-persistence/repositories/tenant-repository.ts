import { eq, desc, count, isNull, and } from 'drizzle-orm';

import type { DrizzleDb } from '../database.js';
import { tenants } from '../schema/tenants.js';
import type { TenantRow } from '../schema/tenants.js';
import type { Tenant } from '@domain/entities/tenant.js';
import type { PlanTier } from '@domain/entities/tenant.js';
import { Tenant as TenantEntity } from '@domain/entities/tenant.js';
import type { ITenantRootRepository } from '@domain/interfaces/tenant-root-repository.interface.js';
import type { PaginationOptions } from '@domain/interfaces/pagination-options.interface.js';
import type { PagedData } from '@domain/interfaces/paged-data.interface.js';

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

  async findAll(options?: PaginationOptions): Promise<PagedData<Tenant>> {
    const page     = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 100;
    const offset   = (page - 1) * pageSize;

    const where = isNull(tenants.deletedAt);

    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(tenants)
        .where(where)
        .limit(pageSize)
        .offset(offset)
        .orderBy(desc(tenants.createdAt)),
      this.db
        .select({ total: count() })
        .from(tenants)
        .where(where),
    ]);

    return {
      items:      rows.map(TenantRepository.toDomain),
      totalCount: countResult[0]?.total ?? 0,
    };
  }

  async create(tenant: Tenant): Promise<Tenant> {
    const rows = await this.db
      .insert(tenants)
      .values({
        id:        tenant.id,
        name:      tenant.name,
        plan:      tenant.plan,
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt,
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
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, id))
      .returning();

    const [row] = rows;
    if (!row) throw new Error('Update returned no rows');
    return TenantRepository.toDomain(row);
  }

  static toDomain(row: TenantRow): Tenant {
    const entity = new TenantEntity({
      id:        row.id,
      name:      row.name,
      plan:      row.plan as PlanTier,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
    entity.deletedAt = row.deletedAt ?? null;
    return entity;
  }
}
