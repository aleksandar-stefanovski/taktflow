import { and, eq, desc, count, isNull } from 'drizzle-orm';
import type { PgTableWithColumns, TableConfig } from 'drizzle-orm/pg-core';

import type { DrizzleDb } from '../database.js';
import type { BaseEntity } from '@domain/entities/base-entity.js';
import type { HasTenant } from '@domain/interfaces/has-tenant.interface.js';
import type { ITenantRepository } from '@domain/interfaces/tenant-repository.interface.js';
import type { PaginationOptions } from '@domain/interfaces/pagination-options.interface.js';
import type { PagedData } from '@domain/interfaces/paged-data.interface.js';

export abstract class BaseTenantRepository<T extends BaseEntity & HasTenant>
  implements ITenantRepository<T> {

  constructor(protected readonly db: DrizzleDb) {}

  protected abstract get table(): PgTableWithColumns<TableConfig>;
  protected abstract mapToDomain(row: Record<string, unknown>): T;
  abstract create(entity: T): Promise<T>;
  abstract update(id: string, tenantId: string, updates: Partial<T>): Promise<T>;

  async findById(id: string, tenantId: string): Promise<T | null> {
    const rows = await this.db
      .select()
      .from(this.table)
      .where(and(
        eq(this.table['id']!, id),
        eq(this.table['tenantId']!, tenantId),
        isNull(this.table['deletedAt']!),
      ))
      .limit(1);

    const [row] = rows;
    return row ? this.mapToDomain(row as Record<string, unknown>) : null;
  }

  async exists(id: string, tenantId: string): Promise<boolean> {
    return (await this.findById(id, tenantId)) !== null;
  }

  async findAll(tenantId: string, options?: PaginationOptions): Promise<PagedData<T>> {
    const page     = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 100;
    const offset   = (page - 1) * pageSize;

    const where = and(eq(this.table['tenantId']!, tenantId), isNull(this.table['deletedAt']!));

    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(this.table)
        .where(where)
        .limit(pageSize)
        .offset(offset)
        .orderBy(desc(this.table['createdAt']!)),
      this.db
        .select({ total: count() })
        .from(this.table)
        .where(where),
    ]);

    return {
      items:      rows.map((row: Record<string, unknown>) => this.mapToDomain(row)),
      totalCount: countResult[0]?.total ?? 0,
    };
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.db
      .delete(this.table)
      .where(and(eq(this.table['id']!, id), eq(this.table['tenantId']!, tenantId)));
  }
}
