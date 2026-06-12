import type { ApiKey } from '@domain/entities/api-key.js';
import type { IEntityBaseReadonlyRepository } from './entity-base-readonly-repository.interface.js';

export interface IApiKeyReadRepository extends IEntityBaseReadonlyRepository<ApiKey> {
  findByKeyHash(keyHash: string): Promise<ApiKey | null>;
}
