import type { ITopicRepository } from '@domain/interfaces/topic-repository.interface.js';
import { Topic } from '@domain/entities/topic.js';
import { NotFoundException } from '@domain/exceptions/not-found-exception.js';
import { ConflictException } from '@domain/exceptions/conflict-exception.js';

import type { UpdateTopicRequest } from '../requests/topics/update-topic.request.js';

export class UpdateTopicHandler {
  constructor(private readonly topics: ITopicRepository) {}

  async handle(id: string, request: UpdateTopicRequest & { tenantId: string }): Promise<Topic> {
    const topic = await this.topics.findById(id, request.tenantId);
    if (!topic) throw new NotFoundException('Topic', id);

    if (request.name !== undefined && request.name !== topic.name) {
      const conflict = await this.topics.findByName(request.name, request.tenantId);
      if (conflict) throw new ConflictException(`Topic '${request.name}' already exists`);
    }

    const mergedConfig = request.config !== undefined
      ? { ...topic.config, ...request.config }
      : undefined;

    return this.topics.update(id, request.tenantId, {
      ...(request.name !== undefined && { name: request.name }),
      ...(mergedConfig !== undefined && { config: mergedConfig }),
    });
  }
}
