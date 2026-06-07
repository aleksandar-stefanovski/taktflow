import type { ApiKey } from '@domain/entities/api-key.js';

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

  static mapFromEntity(apiKey: ApiKey): ApiKeyResponse {
    return new ApiKeyResponse(apiKey);
  }
}

