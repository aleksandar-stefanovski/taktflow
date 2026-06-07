import type { ApiKey } from '@domain/entities/api-key.js';
import type { PaginatedResult } from '@application/responses/paginated-result.js';

import { CreateApiKeyResponse } from '../responses/api-keys/create-api-key.response.js';
import { ApiKeyResponse, ListApiKeysResponse } from '../responses/api-keys/api-key.response.js';

export class ApiKeyMapper {
  static toCreateResponse(apiKey: ApiKey, rawKey: string): CreateApiKeyResponse {
    return new CreateApiKeyResponse(apiKey, rawKey);
  }

  static toDetailResponse(apiKey: ApiKey): ApiKeyResponse {
    return new ApiKeyResponse(apiKey);
  }

  static toListResponse(result: PaginatedResult<ApiKey>): ListApiKeysResponse {
    return new ListApiKeysResponse(result);
  }
}
