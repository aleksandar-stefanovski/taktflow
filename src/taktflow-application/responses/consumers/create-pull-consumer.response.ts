import type { Consumer, ConsumerStatus } from '@domain/entities/consumer.js';
import type { ConsumerConfig } from '@domain/interfaces/consumer-config.interface.js';

export class CreatePullConsumerResponse {
  readonly id:          string;
  readonly topicId:     string;
  readonly name:        string;
  readonly type:        'pull';
  readonly environment: string;
  readonly status:      ConsumerStatus;
  readonly config:      ConsumerConfig;
  readonly createdAt:   string;

  constructor(consumer: Consumer) {
    this.id          = consumer.id;
    this.topicId     = consumer.topicId;
    this.name        = consumer.name;
    this.type        = 'pull';
    this.environment = consumer.environment;
    this.status      = consumer.status;
    this.config      = consumer.config;
    this.createdAt   = consumer.createdAt.toISOString();
  }

  static mapFromEntity(consumer: Consumer): CreatePullConsumerResponse {
    return new CreatePullConsumerResponse(consumer);
  }
}
