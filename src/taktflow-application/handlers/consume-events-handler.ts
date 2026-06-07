import type { IConsumerRepository } from '@domain/interfaces/consumer-repository.interface.js';
import type { IEventQueueService, ClaimedEvent } from '../interfaces/event-queue-service.interface.js';
import { NotFoundException } from '@domain/exceptions/not-found-exception.js';

export class ConsumeEventsHandler {
  constructor(
    private readonly consumers: IConsumerRepository,
    private readonly queue: IEventQueueService,
  ) {}

  async handle(consumerId: string, tenantId: string, limit: number): Promise<ClaimedEvent[]> {
    const consumer = await this.consumers.findById(consumerId, tenantId);
    if (!consumer) throw new NotFoundException('Consumer', consumerId);

    return this.queue.claimForConsumer(consumerId, tenantId, limit);
  }
}
