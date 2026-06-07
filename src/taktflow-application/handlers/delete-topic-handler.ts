import type { ITopicRepository } from '@domain/interfaces/topic-repository.interface.js';
import { NotFoundException } from '@domain/exceptions/not-found-exception.js';

export class DeleteTopicHandler {
  constructor(private readonly topics: ITopicRepository) {}

  async handle(id: string, tenantId: string): Promise<void> {
    const topic = await this.topics.findById(id, tenantId);
    if (!topic) throw new NotFoundException('Topic', id);
    await this.topics.delete(id, tenantId);
  }
}
