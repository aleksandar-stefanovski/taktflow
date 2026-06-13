import { and, count, desc, eq, isNull } from 'drizzle-orm';
import { firstCount } from '../../query.helper.js';
import type { SQL } from 'drizzle-orm';
import type { PgTableWithColumns, TableConfig } from 'drizzle-orm/pg-core';

import type { DrizzleDb } from '../../database.js';
import type { EntityBase } from '@taktflow/domain/entities/entity-base.js';
import type { ICurrentTenantProvider } from '@taktflow/domain/interfaces/current-tenant-provider.interface.js';

export abstract class EntityBaseReadonlyRepository<T extends EntityBase> {
  private readonly _table: PgTableWithColumns<TableConfig>;
  private readonly _tenantProvider: ICurrentTenantProvider;

  constructor(protected readonly db: DrizzleDb, table: object, tenantProvider: ICurrentTenantProvider) {
    this._table          = table as PgTableWithColumns<TableConfig>;
    this._tenantProvider = tenantProvider;
  }

  protected get table(): PgTableWithColumns<TableConfig> {
    return this._table;
  }

  protected get tenantId(): string {
    return this._tenantProvider.getTenantId();
  }

  protected abstract mapToDomain(row: Record<string, unknown>): T;

  protected requiredFilters(): SQL {
    return and(
      eq(this.table['tenantId']!, this.tenantId),
      isNull(this.table['deletedAt']!),
    )!;
  }

  async findById(id: string): Promise<T | null> {
    const rows = await this.db
      .select()
      .from(this.table)
      .where(and(eq(this.table['id']!, id), this.requiredFilters()))
      .limit(1);

    const [row] = rows;
    return row ? this.mapToDomain(row as Record<string, unknown>) : null;
  }

  async findAll(limit: number, offset: number): Promise<T[]> {
    const rows = await this.db
      .select()
      .from(this.table)
      .where(this.requiredFilters())
      .limit(limit)
      .offset(offset)
      .orderBy(desc(this.table['createdAt']!));

    return rows.map((row: Record<string, unknown>) => this.mapToDomain(row));
  }

  async count(): Promise<number> {
    const result = await this.db
      .select({ total: count() })
      .from(this.table)
      .where(this.requiredFilters());

    return firstCount(result);
  }

  async exists(id: string): Promise<boolean> {
    return (await this.findById(id)) !== null;
  }
}
