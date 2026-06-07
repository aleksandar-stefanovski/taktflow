import type { ApiKey } from '@domain/entities/api-key.js';
import type { IApiKeyRepository } from '@domain/interfaces/api-key-repository.interface.js';

import type { PaginationQuery } from '../requests/pagination.request.js';
import { PaginatedResult } from '../responses/paginated-result.js';

export class ListApiKeysHandler {
  constructor(private readonly apiKeys: IApiKeyRepository) {}

  async handle(query: PaginationQuery & { tenantId: string }): Promise<PaginatedResult<ApiKey>> {
    const options = { page: query.page, pageSize: query.pageSize };
    const data    = await this.apiKeys.findAll(query.tenantId, options);
    return new PaginatedResult(data, options);
  }
}
