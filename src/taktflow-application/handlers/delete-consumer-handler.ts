import type { IConsumerRepository } from '@domain/interfaces/consumer-repository.interface.js';
import { NotFoundException } from '@domain/exceptions/not-found-exception.js';

export class DeleteConsumerHandler {
  constructor(private readonly consumers: IConsumerRepository) {}

  async handle(id: string, tenantId: string): Promise<void> {
    const consumer = await this.consumers.findById(id, tenantId);
    if (!consumer) throw new NotFoundException('Consumer', id);
    await this.consumers.delete(id, tenantId);
  }
}
