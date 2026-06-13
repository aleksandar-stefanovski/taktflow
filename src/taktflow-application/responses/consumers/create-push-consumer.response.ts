import type { Consumer, ConsumerStatus } from '@domain/entities/consumer.js';

export class CreatePushConsumerResponse {
  readonly id:          string;
  readonly topicId:     string;
  readonly name:        string;
  readonly type:        'push';
  readonly url:         string;
  readonly environment: string;
  readonly status:      ConsumerStatus;
  readonly createdAt:   string;

  constructor(consumer: Consumer) {
    this.id          = consumer.id;
    this.topicId     = consumer.topicId;
    this.name        = consumer.name;
    this.type        = 'push';
    this.url         = consumer.url!;
    this.environment = consumer.environment;
    this.status      = consumer.status;
    this.createdAt   = consumer.createdAt.toISOString();
  }

  static mapFromEntity(consumer: Consumer): CreatePushConsumerResponse {
    return new CreatePushConsumerResponse(consumer);
  }
}
