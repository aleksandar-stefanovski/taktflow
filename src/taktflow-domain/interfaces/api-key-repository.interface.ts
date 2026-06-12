import type { ApiKey } from '@domain/entities/api-key.js';
import type { IApiKeyReadRepository } from './readonly/api-key-read-repository.interface.js';
import type { IEntityBaseRepository } from './entity-base-repository.interface.js';

export interface IApiKeyRepository
  extends IApiKeyReadRepository,
    IEntityBaseRepository<ApiKey> {}
