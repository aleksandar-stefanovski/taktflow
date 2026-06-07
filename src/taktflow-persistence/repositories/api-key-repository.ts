import { and, eq, isNull } from 'drizzle-orm';

import type { DrizzleDb } from '../database.js';
import { apiKeys } from '../schema/api-keys.js';
import type { ApiKeyRow } from '../schema/api-keys.js';
import type { PgTableWithColumns, TableConfig } from 'drizzle-orm/pg-core';
import { ApiKey } from '@domain/entities/api-key.js';
import type { IApiKeyRepository } from '@domain/interfaces/api-key-repository.interface.js';
import { BaseTenantRepository } from './base-tenant-repository.js';

export class ApiKeyRepository
  extends BaseTenantRepository<ApiKey>
  implements IApiKeyRepository {

  constructor(db: DrizzleDb) {
    super(db);
  }

  protected get table(): PgTableWithColumns<TableConfig> {
    return apiKeys as unknown as PgTableWithColumns<TableConfig>;
  }

  protected mapToDomain(row: Record<string, unknown>): ApiKey {
    return ApiKeyRepository.toDomain(row as ApiKeyRow);
  }

  async create(entity: ApiKey): Promise<ApiKey> {
    const rows = await this.db
      .insert(apiKeys)
      .values({
        id:          entity.id,
        tenantId:    entity.tenantId,
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
    return ApiKeyRepository.toDomain(row);
  }

  async update(id: string, tenantId: string, updates: Partial<ApiKey>): Promise<ApiKey> {
    const rows = await this.db
      .update(apiKeys)
      .set({
        ...(updates.lastUsed !== undefined && { lastUsed: updates.lastUsed }),
        updatedAt: new Date(),
      })
      .where(and(eq(apiKeys.id, id), eq(apiKeys.tenantId, tenantId)))
      .returning();

    const [row] = rows;
    if (!row) throw new Error('Update returned no rows');
    return ApiKeyRepository.toDomain(row);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.db
      .update(apiKeys)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(apiKeys.id, id), eq(apiKeys.tenantId, tenantId)));
  }

  async findByKeyHash(keyHash: string): Promise<ApiKey | null> {
    const rows = await this.db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.keyHash, keyHash), isNull(apiKeys.deletedAt)))
      .limit(1);

    const [row] = rows;
    return row ? ApiKeyRepository.toDomain(row) : null;
  }

  static toDomain(row: ApiKeyRow): ApiKey {
    const entity = new ApiKey({
      id:          row.id,
      tenantId:    row.tenantId,
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
