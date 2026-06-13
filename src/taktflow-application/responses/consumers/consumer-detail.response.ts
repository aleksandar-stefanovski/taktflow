import type { Consumer, ConsumerType, ConsumerStatus } from '@domain/entities/consumer.js';

export class ConsumerDetailResponse {
  readonly id:          string;
  readonly topicId:     string;
  readonly name:        string;
  readonly type:        ConsumerType;
  readonly url:         string | null;
  readonly environment: string;
  readonly status:      ConsumerStatus;
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
    this.createdAt   = consumer.createdAt.toISOString();
    this.updatedAt   = consumer.updatedAt.toISOString();
  }

  static mapFromEntity(consumer: Consumer): ConsumerDetailResponse {
    return new ConsumerDetailResponse(consumer);
  }
}
