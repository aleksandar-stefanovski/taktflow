import type { ApiKey } from '@domain/entities/api-key.js';

export class CreateApiKeyResponse {
  readonly id:          string;
  readonly name:        string;
  readonly keyPrefix:   string;
  readonly environment: string;
  readonly rawKey:      string;
  readonly createdAt:   string;

  constructor(apiKey: ApiKey, rawKey: string) {
    this.id          = apiKey.id;
    this.name        = apiKey.name;
    this.keyPrefix   = apiKey.keyPrefix;
    this.environment = apiKey.environment;
    this.rawKey      = rawKey;
    this.createdAt   = apiKey.createdAt.toISOString();
  }
}
