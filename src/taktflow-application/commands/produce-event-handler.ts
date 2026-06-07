import { createHash, randomUUID } from 'crypto';

import type { IEventRepository } from '@domain/interfaces/event-repository.interface.js';
import type { ITopicRepository } from '@domain/interfaces/topic-repository.interface.js';
import type { IConsumerRepository } from '@domain/interfaces/consumer-repository.interface.js';
import type { IUsageService } from '../interfaces/usage-service.interface.js';
import type { IEventQueueService } from '../interfaces/event-queue-service.interface.js';
import { Event } from '@domain/entities/event.js';
import { NotFoundException } from '@domain/exceptions/not-found-exception.js';
import { canonicalJson } from '@utils/canonical-json.helper.js';

import type { ProduceEventRequest } from '../requests/events/produce-event.request.js';

export class ProduceEventHandler {
  constructor(
    private readonly events: IEventRepository,
    private readonly topics: ITopicRepository,
    private readonly consumers: IConsumerRepository,
    private readonly queue: IEventQueueService,
    private readonly usage: IUsageService,
  ) {}

  async handle(request: ProduceEventRequest & { tenantId: string }): Promise<Event> {
    await this.usage.assertWithinLimit(request.tenantId, 1);

    const topic = await this.topics.findById(request.topicId, request.tenantId);
    if (!topic) throw new NotFoundException('Topic', request.topicId);

    if (request.idempotencyKey) {
      const existing = await this.events.findByIdempotencyKey(
        request.idempotencyKey,
        request.tenantId,
      );
      if (existing) return existing;
    }

    const checksum = createHash('sha256')
      .update(canonicalJson(request.payload))
      .digest('hex');

    const event = new Event({
      tenantId:       request.tenantId,
      topicId:        topic.id,
      payload:        request.payload,
      checksum,
      source:         'sdk',
      idempotencyKey: request.idempotencyKey ?? null,
    });

    await this.events.create(event);

    const { items: activeConsumers } = await this.consumers.findByTopicId(
      topic.id,
      request.tenantId,
      { page: 1, pageSize: 100 },
    );

    const now = new Date();
    await Promise.all(
      activeConsumers
        .filter(consumer => consumer.status === 'active')
        .map(consumer =>
          this.queue.enqueue({
            id:          randomUUID(),
            eventId:     event.id,
            tenantId:    request.tenantId,
            topicId:     topic.id,
            consumerId:  consumer.id,
            payload:     request.payload,
            attempt:     0,
            scheduledAt: now,
          }),
        ),
    );

    return event;
  }
}
