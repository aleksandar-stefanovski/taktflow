import { createHash, randomBytes } from 'crypto';

import type { IApiKeyRepository } from '@domain/interfaces/api-key-repository.interface.js';
import { ApiKey } from '@domain/entities/api-key.js';

import { API_KEY_PREFIX } from '@types/api-key-constants.js';

import type { CreateApiKeyRequest } from '../requests/api-keys/create-api-key.request.js';
import type { CreateApiKeyResult } from '../interfaces/create-api-key-result.interface.js';

export class CreateApiKeyHandler {
  constructor(private readonly apiKeys: IApiKeyRepository) {}

  async handle(request: CreateApiKeyRequest & { tenantId: string }): Promise<CreateApiKeyResult> {
    const rawKey    = `${API_KEY_PREFIX}${randomBytes(32).toString('hex')}`;
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
}
