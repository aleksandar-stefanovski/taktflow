import type { Consumer } from '@domain/entities/consumer.js';
import type { PaginatedResult } from '@application/responses/paginated-result.js';

import { ConsumerSummaryResponse, ListConsumersResponse } from '../responses/consumers/list-consumers.response.js';

export class ConsumerMapper {
  static toSummaryResponse(consumer: Consumer): ConsumerSummaryResponse {
    return new ConsumerSummaryResponse(consumer);
  }

  static toListResponse(result: PaginatedResult<Consumer>): ListConsumersResponse {
    return new ListConsumersResponse(result);
  }
}
