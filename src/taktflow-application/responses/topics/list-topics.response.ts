import type { Topic } from '@domain/entities/topic.js';
import type { TopicConfig } from '@domain/interfaces/topic-config.interface.js';

import { PaginatedResult } from '../paginated-result.js';

export class TopicSummaryResponse {
  readonly id:        string;
  readonly name:      string;
  readonly config:    TopicConfig;
  readonly createdAt: string;
  readonly updatedAt: string;

  constructor(topic: Topic) {
    this.id        = topic.id;
    this.name      = topic.name;
    this.config    = topic.config;
    this.createdAt = topic.createdAt.toISOString();
    this.updatedAt = topic.updatedAt.toISOString();
  }
}

export class ListTopicsResponse {
  readonly items:       TopicSummaryResponse[];
  readonly totalCount:  number;
  readonly totalPages:  number;
  readonly currentPage: number;
  readonly pageSize:    number;

  constructor(result: PaginatedResult<Topic>) {
    this.items       = result.items.map((topic) => new TopicSummaryResponse(topic));
    this.totalCount  = result.totalCount;
    this.totalPages  = result.totalPages;
    this.currentPage = result.currentPage;
    this.pageSize    = result.pageSize;
  }
}
