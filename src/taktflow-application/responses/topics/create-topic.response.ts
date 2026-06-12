import type { Topic } from '@domain/entities/topic.js';
import type { TopicConfig } from '@domain/value-objects/topic-config.js';

export class CreateTopicResponse {
  readonly id:        string;
  readonly name:      string;
  readonly config:    TopicConfig;
  readonly createdAt: string;

  constructor(topic: Topic) {
    this.id        = topic.id;
    this.name      = topic.name;
    this.config    = topic.config;
    this.createdAt = topic.createdAt.toISOString();
  }

  static mapFromEntity(topic: Topic): CreateTopicResponse {
    return new CreateTopicResponse(topic);
  }
}
