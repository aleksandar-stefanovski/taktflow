import type { ApiKey } from '@domain/entities/api-key.js';

import { PaginatedResult } from '../paginated-result.js';

export class ApiKeyResponse {
  readonly id:          string;
  readonly name:        string;
  readonly keyPrefix:   string;
  readonly environment: string;
  readonly lastUsed:    string | null;
  readonly createdAt:   string;
  readonly updatedAt:   string;

  constructor(apiKey: ApiKey) {
    this.id          = apiKey.id;
    this.name        = apiKey.name;
    this.keyPrefix   = apiKey.keyPrefix;
    this.environment = apiKey.environment;
    this.lastUsed    = apiKey.lastUsed?.toISOString() ?? null;
    this.createdAt   = apiKey.createdAt.toISOString();
    this.updatedAt   = apiKey.updatedAt.toISOString();
  }
}

export class ListApiKeysResponse {
  readonly items:       ApiKeyResponse[];
  readonly totalCount:  number;
  readonly totalPages:  number;
  readonly currentPage: number;
  readonly pageSize:    number;

  constructor(result: PaginatedResult<ApiKey>) {
    this.items       = result.items.map((apiKey) => new ApiKeyResponse(apiKey));
    this.totalCount  = result.totalCount;
    this.totalPages  = result.totalPages;
    this.currentPage = result.currentPage;
    this.pageSize    = result.pageSize;
  }
}
