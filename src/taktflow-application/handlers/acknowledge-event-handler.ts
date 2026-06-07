import { getRetryDelay } from '@types/retry-constants.js';

import type { IEventDeliveryRepository } from '@domain/interfaces/event-delivery-repository.interface.js';
import type { IConsumerRepository } from '@domain/interfaces/consumer-repository.interface.js';
import { NotFoundException } from '@domain/exceptions/not-found-exception.js';

import type { IEventQueueService } from '../interfaces/event-queue-service.interface.js';
import type { AcknowledgeEventRequest } from '../requests/events/acknowledge-event.request.js';

export class AcknowledgeEventHandler {
  constructor(
    private readonly deliveries: IEventDeliveryRepository,
    private readonly consumers: IConsumerRepository,
    private readonly queue: IEventQueueService,
  ) {}

  async handle(
    eventId: string,
    request: AcknowledgeEventRequest & { tenantId: string },
  ): Promise<void> {
    const all = await this.deliveries.findByEventId(eventId, request.tenantId);
    const delivery = all.find(
      (d) => d.status === 'processing' || d.status === 'awaiting_ack',
    );

    if (!delivery) throw new NotFoundException('EventDelivery for event', eventId);

    if (request.status === 'success') {
      await this.queue.acknowledge(delivery.id);
      return;
    }

    const consumer = await this.consumers.findById(delivery.consumerId, request.tenantId);
    if (!consumer) throw new NotFoundException('Consumer', delivery.consumerId);

    const reason = request.error ?? 'Consumer reported failure';

    if (delivery.retryCount >= consumer.config.retryAttempts) {
      await this.queue.moveToDeadLetter(delivery.id, reason);
      return;
    }

    await this.queue.scheduleRetry(delivery.id, getRetryDelay(delivery.retryCount));
  }
}
