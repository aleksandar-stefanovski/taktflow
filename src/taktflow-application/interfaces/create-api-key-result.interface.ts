import type { ApiKey } from '@domain/entities/api-key.js';

export interface CreateApiKeyResult {
  apiKey: ApiKey;
  rawKey: string;
}
