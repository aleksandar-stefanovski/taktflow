import { createHash, randomUUID } from 'node:crypto';

import type { IEventRepository } from '@domain/interfaces/event-repository.interface.js';
import type { ITopicRepository } from '@domain/interfaces/topic-repository.interface.js';
import type { IConsumerRepository } from '@domain/interfaces/consumer-repository.interface.js';
import { Event } from '@domain/entities/event.js';
import { EntityKey } from '@domain/entities/entity-key.js';
import { NotFoundException } from '@domain/exceptions/not-found-exception.js';
import { PlanLimitException } from '@domain/exceptions/plan-limit-exception.js';

import { canonicalJson } from '@utils/canonical-json.helper.js';

import type { IUsageService } from '@application/interfaces/usage-service.interface.js';
import type { IEventQueueService } from '@domain/interfaces/event-queue-service.interface.js';
import type { IEventService }      from '../interfaces/event-service.interface.js';
import type { ProduceEventRequest } from '../requests/events/produce-event.request.js';
import type { ListEventsQuery } from '../requests/events/list-events.request.js';
import { PaginatedResponse } from '../responses/paginated-response.js';

export class EventService implements IEventService {
  constructor(
    private readonly events:    IEventRepository,
    private readonly topics:    ITopicRepository,
    private readonly consumers: IConsumerRepository,
    private readonly queue:     IEventQueueService,
    private readonly usage:     IUsageService,
  ) {}

  async produce(request: ProduceEventRequest & { tenantId: string }): Promise<Event> {
    await this.usage.assertWithinLimit(request.tenantId, 1);

    const topic = await this.topics.findById(request.topicId);
    if (!topic) throw new NotFoundException('Topic', request.topicId);

    const payloadBytes = Buffer.byteLength(JSON.stringify(request.payload));
    if (payloadBytes > topic.config.maxPayloadBytes) {
      throw new PlanLimitException('Payload size', topic.config.maxPayloadBytes);
    }

    if (request.idempotencyKey) {
      const existing = await this.events.findByIdempotencyKey(request.idempotencyKey);
      if (existing) return existing;
    }

    const checksum = createHash('sha256')
      .update(canonicalJson(request.payload))
      .digest('hex');

    const event = new Event({
      key:            EntityKey.create(request.tenantId),
      topicId:        topic.id,
      payload:        request.payload,
      checksum,
      source:         'api',
      idempotencyKey: request.idempotencyKey ?? null,
    });

    await this.events.create(event);

    const activeConsumers = await this.consumers.findByTopicId(topic.id, 100, 0);

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

  async getById(eventId: string, tenantId: string): Promise<Event> {
    const event = await this.events.findById(eventId);
    if (!event) throw new NotFoundException('Event', eventId);
    return event;
  }

  async list(query: ListEventsQuery & { tenantId: string }): Promise<PaginatedResponse<Event>> {
    const limit  = query.pageSize;
    const offset = (query.page - 1) * query.pageSize;

    const [items, totalCount] = query.topicId
      ? await Promise.all([
          this.events.findByTopicId(query.topicId, limit, offset),
          this.events.countByTopicId(query.topicId),
        ])
      : await Promise.all([
          this.events.findAll(limit, offset),
          this.events.count(),
        ]);

    return new PaginatedResponse(items, totalCount, query.page, query.pageSize);
  }
}
