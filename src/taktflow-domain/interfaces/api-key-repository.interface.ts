import type { ApiKey } from '../entities/api-key.js';
import type { ITenantRepository } from './tenant-repository.interface.js';

export interface IApiKeyRepository extends ITenantRepository<ApiKey> {
  findByKeyHash(keyHash: string): Promise<ApiKey | null>;
}
