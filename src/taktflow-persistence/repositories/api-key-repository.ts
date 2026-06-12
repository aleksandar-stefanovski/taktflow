import { and, eq, isNull } from 'drizzle-orm';

import type { DrizzleDb } from '../database.js';
import { apiKeys } from '../schema/api-keys.js';
import type { ApiKeyRow } from '../schema/api-keys.js';
import { ApiKey } from '@domain/entities/api-key.js';
import type { IApiKeyRepository } from '@domain/interfaces/api-key-repository.interface.js';
import type { ICurrentTenantProvider } from '@domain/interfaces/current-tenant-provider.interface.js';
import { ApiKeyReadonlyRepository } from './readonly/api-key-readonly-repository.js';
import { EntityBaseRepository } from './entity-base-repository.js';

export class ApiKeyRepository
  extends EntityBaseRepository<ApiKey>
  implements IApiKeyRepository {

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

  async create(entity: ApiKey): Promise<ApiKey> {
    const rows = await this.db
      .insert(apiKeys)
      .values({
        id:          entity.id,
        tenantId:    entity.key.tenantId!,
        name:        entity.name,
        keyHash:     entity.keyHash,
        keyPrefix:   entity.keyPrefix,
        environment: entity.environment,
        lastUsed:    entity.lastUsed,
        createdAt:   entity.createdAt,
        updatedAt:   entity.updatedAt,
      })
      .returning();

    const [row] = rows;
    if (!row) throw new Error('Insert returned no rows');
    return ApiKeyReadonlyRepository.toDomain(row);
  }

  async update(id: string, updates: Partial<ApiKey>): Promise<ApiKey> {
    const rows = await this.db
      .update(apiKeys)
      .set({
        ...(updates.lastUsed !== undefined && { lastUsed: updates.lastUsed }),
        updatedAt: new Date(),
      })
      .where(and(eq(apiKeys.id, id), eq(apiKeys.tenantId, this.tenantId)))
      .returning();

    const [row] = rows;
    if (!row) throw new Error('Update returned no rows');
    return ApiKeyReadonlyRepository.toDomain(row);
  }
}
