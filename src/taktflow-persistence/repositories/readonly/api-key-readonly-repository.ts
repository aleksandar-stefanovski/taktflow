import { and, eq, isNull } from 'drizzle-orm';

import type { DrizzleDb } from '../../database.js';
import { apiKeys } from '../../schema/api-keys.js';
import type { ApiKeyRow } from '../../schema/api-keys.js';
import { ApiKey } from '@domain/entities/api-key.js';
import { EntityKey } from '@domain/entities/entity-key.js';
import type { ICurrentTenantProvider } from '@domain/interfaces/current-tenant-provider.interface.js';
import { EntityBaseReadonlyRepository } from './entity-base-readonly-repository.js';

export class ApiKeyReadonlyRepository extends EntityBaseReadonlyRepository<ApiKey> {
  constructor(db: DrizzleDb, tenantProvider: ICurrentTenantProvider) {
    super(db, apiKeys, tenantProvider);
  }

  protected mapToDomain(row: Record<string, unknown>): ApiKey {
    return ApiKeyReadonlyRepository.toDomain(row as ApiKeyRow);
  }

  async findByKeyHash(keyHash: string): Promise<ApiKey | null> {
    const rows = await this.db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.keyHash, keyHash), isNull(apiKeys.deletedAt)))
      .limit(1);

    const [row] = rows;
    return row ? ApiKeyReadonlyRepository.toDomain(row) : null;
  }

  static toDomain(row: ApiKeyRow): ApiKey {
    const entity = new ApiKey({
      key:         EntityKey.reconstitute(row.id, row.tenantId),
      name:        row.name,
      keyHash:     row.keyHash,
      keyPrefix:   row.keyPrefix,
      environment: row.environment,
      lastUsed:    row.lastUsed ?? null,
      createdAt:   row.createdAt,
      updatedAt:   row.updatedAt,
    });
    entity.deletedAt = row.deletedAt ?? null;
    return entity;
  }
}
