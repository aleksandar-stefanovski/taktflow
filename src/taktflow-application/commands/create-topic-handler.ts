import type { ITopicRepository } from '@domain/interfaces/topic-repository.interface.js';
import { Topic } from '@domain/entities/topic.js';
import { ConflictException } from '@domain/exceptions/conflict-exception.js';

import type { CreateTopicRequest } from '../requests/topics/create-topic.request.js';

export class CreateTopicHandler {
  constructor(private readonly topics: ITopicRepository) {}

  async handle(request: CreateTopicRequest & { tenantId: string }): Promise<Topic> {
    const existing = await this.topics.findByName(request.name, request.tenantId);
    if (existing) throw new ConflictException(`Topic '${request.name}' already exists`);

    const topic = new Topic({
      tenantId: request.tenantId,
      name:     request.name,
      ...(request.config !== undefined && { config: request.config }),
    });

    return this.topics.create(topic);
  }
}
