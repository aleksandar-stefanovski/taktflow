import { randomUUID } from 'crypto';

import type { IDeadLetterEventRepository } from '@domain/interfaces/dead-letter-event-repository.interface.js';
import type { IConsumerRepository } from '@domain/interfaces/consumer-repository.interface.js';
import type { IEventQueueService } from '../interfaces/event-queue-service.interface.js';
import { NotFoundException } from '@domain/exceptions/not-found-exception.js';
import { ConflictException } from '@domain/exceptions/conflict-exception.js';

export class ReplayDeadLetterEventHandler {
  constructor(
    private readonly dlq: IDeadLetterEventRepository,
    private readonly consumers: IConsumerRepository,
    private readonly queue: IEventQueueService,
  ) {}

  async handle(id: string, tenantId: string): Promise<void> {
    const dlqEvent = await this.dlq.findById(id, tenantId);
    if (!dlqEvent) throw new NotFoundException('DeadLetterEvent', id);
    if (dlqEvent.replayed) throw new ConflictException(`DeadLetterEvent ${id} has already been replayed`);

    const consumer = await this.consumers.findById(dlqEvent.consumerId, tenantId);
    if (!consumer) throw new NotFoundException('Consumer', dlqEvent.consumerId);

    await this.queue.enqueue({
      id:          randomUUID(),
      eventId:     dlqEvent.eventId,
      tenantId:    dlqEvent.tenantId,
      topicId:     consumer.topicId,
      consumerId:  dlqEvent.consumerId,
      payload:     dlqEvent.payloadSnapshot,
      attempt:     0,
      scheduledAt: new Date(),
    });

    await this.dlq.update(id, tenantId, { replayed: true, replayedAt: new Date() });
  }
}
