import type { Consumer, ConsumerStatus } from '@domain/entities/consumer.js';

export class CreatePullConsumerResponse {
  readonly id:          string;
  readonly topicId:     string;
  readonly name:        string;
  readonly type:        'pull';
  readonly environment: string;
  readonly status:      ConsumerStatus;
  readonly alertEmail:  string | null;
  readonly createdAt:   string;

  constructor(consumer: Consumer) {
    this.id          = consumer.id;
    this.topicId     = consumer.topicId;
    this.name        = consumer.name;
    this.type        = 'pull';
    this.environment = consumer.environment;
    this.status      = consumer.status;
    this.alertEmail  = consumer.alertEmail;
    this.createdAt   = consumer.createdAt.toISOString();
  }

  static mapFromEntity(consumer: Consumer): CreatePullConsumerResponse {
    return new CreatePullConsumerResponse(consumer);
  }
}
