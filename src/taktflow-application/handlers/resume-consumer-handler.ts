import type { IConsumerRepository } from '@domain/interfaces/consumer-repository.interface.js';
import { Consumer } from '@domain/entities/consumer.js';
import { NotFoundException } from '@domain/exceptions/not-found-exception.js';

export class ResumeConsumerHandler {
  constructor(private readonly consumers: IConsumerRepository) {}

  async handle(id: string, tenantId: string): Promise<Consumer> {
    const consumer = await this.consumers.findById(id, tenantId);
    if (!consumer) throw new NotFoundException('Consumer', id);
    return this.consumers.update(id, tenantId, { status: 'active' });
  }
}
