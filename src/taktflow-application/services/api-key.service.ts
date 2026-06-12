import { createHash, randomBytes } from 'node:crypto';

import type { IApiKeyRepository } from '@domain/interfaces/api-key-repository.interface.js';
import { ApiKey } from '@domain/entities/api-key.js';
import { EntityKey } from '@domain/entities/entity-key.js';
import { NotFoundException } from '@domain/exceptions/not-found-exception.js';

import type { CreateApiKeyRequest } from '../requests/api-keys/create-api-key.request.js';
import type { PaginationQuery } from '../requests/pagination.request.js';
import { PaginatedResult } from '../responses/paginated-result.js';

export class ApiKeyService {
  constructor(
    private readonly apiKeys:       IApiKeyRepository,
    private readonly apiKeyPrefix:  string,
  ) {}

  async create(request: CreateApiKeyRequest & { tenantId: string }): Promise<{ apiKey: ApiKey; rawKey: string }> {
    const rawKey    = `${this.apiKeyPrefix}${randomBytes(32).toString('hex')}`;
    const keyHash   = createHash('sha256').update(rawKey).digest('hex');
    const keyPrefix = rawKey.substring(0, 16);

    const apiKey = new ApiKey({
      key:         new EntityKey(request.tenantId),
      name:        request.name,
      keyHash,
      keyPrefix,
      environment: request.environment,
    });

    const savedApiKey = await this.apiKeys.create(apiKey);
    return { apiKey: savedApiKey, rawKey };
  }

  async getById(id: string, tenantId: string): Promise<ApiKey> {
    const apiKey = await this.apiKeys.findById(id);
    if (!apiKey) throw new NotFoundException('ApiKey', id);
    return apiKey;
  }

  async list(query: PaginationQuery & { tenantId: string }): Promise<PaginatedResult<ApiKey>> {
    const limit  = query.pageSize;
    const offset = (query.page - 1) * query.pageSize;

    const [items, totalCount] = await Promise.all([
      this.apiKeys.findAll(limit, offset),
      this.apiKeys.count(),
    ]);

    return new PaginatedResult(items, totalCount, query.page, query.pageSize);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    const apiKey = await this.apiKeys.findById(id);
    if (!apiKey) throw new NotFoundException('ApiKey', id);
    await this.apiKeys.delete(id);
  }
}
