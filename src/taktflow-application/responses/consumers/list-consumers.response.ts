import type { Consumer, ConsumerType, ConsumerStatus } from '@domain/entities/consumer.js';
import type { ConsumerConfig } from '@domain/interfaces/consumer-config.interface.js';

import { PaginatedResult } from '../paginated-result.js';

export class ConsumerSummaryResponse {
  readonly id:          string;
  readonly topicId:     string;
  readonly name:        string;
  readonly type:        ConsumerType;
  readonly url:         string | null;
  readonly environment: string;
  readonly status:      ConsumerStatus;
  readonly config:      ConsumerConfig;
  readonly createdAt:   string;
  readonly updatedAt:   string;

  constructor(consumer: Consumer) {
    this.id          = consumer.id;
    this.topicId     = consumer.topicId;
    this.name        = consumer.name;
    this.type        = consumer.type;
    this.url         = consumer.url;
    this.environment = consumer.environment;
    this.status      = consumer.status;
    this.config      = consumer.config;
    this.createdAt   = consumer.createdAt.toISOString();
    this.updatedAt   = consumer.updatedAt.toISOString();
  }
}

export class ListConsumersResponse {
  readonly items:       ConsumerSummaryResponse[];
  readonly totalCount:  number;
  readonly totalPages:  number;
  readonly currentPage: number;
  readonly pageSize:    number;

  constructor(result: PaginatedResult<Consumer>) {
    this.items       = result.items.map((consumer) => new ConsumerSummaryResponse(consumer));
    this.totalCount  = result.totalCount;
    this.totalPages  = result.totalPages;
    this.currentPage = result.currentPage;
    this.pageSize    = result.pageSize;
  }
}
