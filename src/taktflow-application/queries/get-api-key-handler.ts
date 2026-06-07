import type { IApiKeyRepository } from '@domain/interfaces/api-key-repository.interface.js';
import type { ApiKey } from '@domain/entities/api-key.js';
import { NotFoundException } from '@domain/exceptions/not-found-exception.js';

export class GetApiKeyHandler {
  constructor(private readonly apiKeys: IApiKeyRepository) {}

  async handle(id: string, tenantId: string): Promise<ApiKey> {
    const apiKey = await this.apiKeys.findById(id, tenantId);
    if (!apiKey) throw new NotFoundException('ApiKey', id);
    return apiKey;
  }
}
