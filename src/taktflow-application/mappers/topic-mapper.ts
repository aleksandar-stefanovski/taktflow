import type { Topic } from '@domain/entities/topic.js';
import type { PaginatedResult } from '@application/responses/paginated-result.js';

import { CreateTopicResponse } from '../responses/topics/create-topic.response.js';
import { TopicSummaryResponse, ListTopicsResponse } from '../responses/topics/list-topics.response.js';

export class TopicMapper {
  static toCreateResponse(topic: Topic): CreateTopicResponse {
    return new CreateTopicResponse(topic);
  }

  static toSummaryResponse(topic: Topic): TopicSummaryResponse {
    return new TopicSummaryResponse(topic);
  }

  static toListResponse(result: PaginatedResult<Topic>): ListTopicsResponse {
    return new ListTopicsResponse(result);
  }
}
