import { createHash, randomBytes } from 'crypto';

import type { IApiKeyRepository } from '@domain/interfaces/api-key-repository.interface.js';
import { ApiKey } from '@domain/entities/api-key.js';
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
      tenantId:    request.tenantId,
      name:        request.name,
      keyHash,
      keyPrefix,
      environment: request.environment,
    });

    const savedApiKey = await this.apiKeys.create(apiKey);
    return { apiKey: savedApiKey, rawKey };
  }

  async getById(id: string, tenantId: string): Promise<ApiKey> {
    const apiKey = await this.apiKeys.findById(id, tenantId);
    if (!apiKey) throw new NotFoundException('ApiKey', id);
    return apiKey;
  }

  async list(query: PaginationQuery & { tenantId: string }): Promise<PaginatedResult<ApiKey>> {
    const options = { page: query.page, pageSize: query.pageSize };
    const data    = await this.apiKeys.findAll(query.tenantId, options);
    return new PaginatedResult(data, options);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    const apiKey = await this.apiKeys.findById(id, tenantId);
    if (!apiKey) throw new NotFoundException('ApiKey', id);
    await this.apiKeys.delete(id, tenantId);
  }
}
