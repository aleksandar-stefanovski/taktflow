import type { Topic }               from '@domain/entities/topic.js';
import type { CreateTopicRequest }  from '../requests/topics/create-topic.request.js';
import type { UpdateTopicRequest }  from '../requests/topics/update-topic.request.js';
import type { PaginationQuery }     from '../requests/pagination.request.js';
import type { PaginatedResponse }     from '../responses/paginated-response.js';

export interface ITopicService {
  create(request: CreateTopicRequest & { tenantId: string }): Promise<Topic>;
  getById(id: string, tenantId: string): Promise<Topic>;
  update(id: string, request: UpdateTopicRequest & { tenantId: string }): Promise<Topic>;
  delete(id: string, tenantId: string): Promise<void>;
  list(query: PaginationQuery & { tenantId: string }): Promise<PaginatedResponse<Topic>>;
}
