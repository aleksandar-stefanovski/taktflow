import type { IApiKeyRepository } from '@domain/interfaces/api-key-repository.interface.js';
import { NotFoundException } from '@domain/exceptions/not-found-exception.js';

export class DeleteApiKeyHandler {
  constructor(private readonly apiKeys: IApiKeyRepository) {}

  async handle(id: string, tenantId: string): Promise<void> {
    const apiKey = await this.apiKeys.findById(id, tenantId);
    if (!apiKey) throw new NotFoundException('ApiKey', id);
    await this.apiKeys.delete(id, tenantId);
  }
}
