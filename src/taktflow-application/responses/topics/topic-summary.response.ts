import type { Topic } from '@domain/entities/topic.js';
import type { TopicConfig } from '@domain/interfaces/topic-config.interface.js';

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

  static mapFromEntity(topic: Topic): TopicSummaryResponse {
    return new TopicSummaryResponse(topic);
  }
}
