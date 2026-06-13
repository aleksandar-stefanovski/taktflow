import type { ApiKey }              from '@taktflow/domain/entities/api-key.js';
import type { CreateApiKeyRequest } from '../requests/api-keys/create-api-key.request.js';
import type { PaginationQuery }     from '../requests/pagination.request.js';
import type { PaginatedResponse }     from '../responses/paginated-response.js';

export interface IApiKeyService {
  create(request: CreateApiKeyRequest & { tenantId: string }): Promise<{ apiKey: ApiKey; rawKey: string }>;
  getById(id: string, tenantId: string): Promise<ApiKey>;
  list(query: PaginationQuery & { tenantId: string }): Promise<PaginatedResponse<ApiKey>>;
  delete(id: string, tenantId: string): Promise<void>;
}
