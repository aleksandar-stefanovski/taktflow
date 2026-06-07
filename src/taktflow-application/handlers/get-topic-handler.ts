import type { ITopicRepository } from '@domain/interfaces/topic-repository.interface.js';
import { Topic } from '@domain/entities/topic.js';
import { NotFoundException } from '@domain/exceptions/not-found-exception.js';

export class GetTopicHandler {
  constructor(private readonly topics: ITopicRepository) {}

  async handle(id: string, tenantId: string): Promise<Topic> {
    const topic = await this.topics.findById(id, tenantId);
    if (!topic) throw new NotFoundException('Topic', id);
    return topic;
  }
}
