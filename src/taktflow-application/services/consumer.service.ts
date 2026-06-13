import { randomBytes } from 'node:crypto';

import type { IConsumerRepository } from '@taktflow/domain/interfaces/consumer-repository.interface.js';
import type { ITopicRepository } from '@taktflow/domain/interfaces/topic-repository.interface.js';
import type { IEventDeliveryRepository } from '@taktflow/domain/interfaces/event-delivery-repository.interface.js';
import { Consumer } from '@taktflow/domain/entities/consumer.js';
import { EntityKey } from '@taktflow/domain/entities/entity-key.js';
import { NotFoundException } from '@taktflow/domain/exceptions/not-found-exception.js';
import { ValidationException } from '@taktflow/domain/exceptions/validation-exception.js';

import type { IEventQueueService } from '@taktflow/domain/interfaces/event-queue-service.interface.js';
import type { ClaimedEvent } from '@taktflow/domain/types/claimed-event.type.js';
import type { IConsumerService }                 from '../interfaces/consumer-service.interface.js';
import type { EventDelivery } from '@taktflow/domain/entities/event-delivery.js';
import type { CreatePushConsumerRequest } from '../requests/consumers/create-push-consumer.request.js';
import type { CreatePullConsumerRequest } from '../requests/consumers/create-pull-consumer.request.js';
import type { ListConsumersQuery } from '../requests/consumers/list-consumers.request.js';
import type { UpdateConsumerRequest } from '../requests/consumers/update-consumer.request.js';
import type { AcknowledgeEventRequest } from '../requests/events/acknowledge-event.request.js';
import { PaginatedResponse } from '../responses/paginated-response.js';

export class ConsumerService implements IConsumerService {
  constructor(
    private readonly consumers:          IConsumerRepository,
    private readonly topics:             ITopicRepository,
    private readonly deliveries:         IEventDeliveryRepository,
    private readonly queue:            IEventQueueService,
    private readonly retryBaseDelayMs: number,
    private readonly maxRetryAttempts: number,
  ) {}

  private getRetryDelay(attempt: number): number {
    return this.retryBaseDelayMs * Math.pow(2, attempt);
  }

  async createPush(request: CreatePushConsumerRequest & { tenantId: string }): Promise<Consumer> {
    const topic = await this.topics.findById(request.topicId);
    if (!topic) throw new NotFoundException('Topic', request.topicId);

    const secret   = randomBytes(32).toString('hex');
    const consumer = new Consumer({
      key:               EntityKey.create(request.tenantId),
      topicId:           request.topicId,
      name:              request.name,
      type:              'push',
      url:         request.url,
      secret,
      environment: request.environment,
    });

    return this.consumers.create(consumer);
  }

  async createPull(request: CreatePullConsumerRequest & { tenantId: string }): Promise<Consumer> {
    const topic = await this.topics.findById(request.topicId);
    if (!topic) throw new NotFoundException('Topic', request.topicId);

    const secret   = randomBytes(32).toString('hex');
    const consumer = new Consumer({
      key:         EntityKey.create(request.tenantId),
      topicId:     request.topicId,
      name:        request.name,
      type:        'pull',
      url:         null,
      secret,
      environment: request.environment,
    });

    return this.consumers.create(consumer);
  }

  async getById(id: string, tenantId: string): Promise<Consumer> {
    const consumer = await this.consumers.findById(id);
    if (!consumer) throw new NotFoundException('Consumer', id);
    return consumer;
  }

  async getHealth(consumerId: string, tenantId: string): Promise<EventDelivery[]> {
    const consumer = await this.consumers.findById(consumerId);
    if (!consumer) throw new NotFoundException('Consumer', consumerId);
    return this.deliveries.findByConsumerId(consumerId);
  }

  async list(query: ListConsumersQuery & { tenantId: string }): Promise<PaginatedResponse<Consumer>> {
    const limit  = query.pageSize;
    const offset = (query.page - 1) * query.pageSize;

    const [items, totalCount] = query.topicId
      ? await Promise.all([
          this.consumers.findByTopicId(query.topicId, limit, offset),
          this.consumers.countByTopicId(query.topicId),
        ])
      : await Promise.all([
          this.consumers.findAll(limit, offset),
          this.consumers.count(),
        ]);

    return new PaginatedResponse(items, totalCount, query.page, query.pageSize);
  }

  async update(id: string, request: UpdateConsumerRequest & { tenantId: string }): Promise<Consumer> {
    const consumer = await this.consumers.findById(id);
    if (!consumer) throw new NotFoundException('Consumer', id);

    if (request.url !== undefined && consumer.type === 'pull') {
      throw new ValidationException('Pull consumers do not have a URL');
    }

    return this.consumers.update(id, {
      ...(request.name !== undefined && { name: request.name }),
      ...(request.url !== undefined && { url: request.url }),
    });
  }

  async delete(id: string, tenantId: string): Promise<void> {
    const consumer = await this.consumers.findById(id);
    if (!consumer) throw new NotFoundException('Consumer', id);
    await this.consumers.delete(id);
  }

  async pause(id: string, tenantId: string): Promise<Consumer> {
    const consumer = await this.consumers.findById(id);
    if (!consumer) throw new NotFoundException('Consumer', id);
    return this.consumers.update(id, { status: 'paused' });
  }

  async resume(id: string, tenantId: string): Promise<Consumer> {
    const consumer = await this.consumers.findById(id);
    if (!consumer) throw new NotFoundException('Consumer', id);
    return this.consumers.update(id, { status: 'active' });
  }

  async consume(consumerId: string, tenantId: string, limit: number): Promise<ClaimedEvent[]> {
    const consumer = await this.consumers.findById(consumerId);
    if (!consumer) throw new NotFoundException('Consumer', consumerId);
    return this.queue.claimForConsumer(consumerId, tenantId, limit);
  }

  async acknowledge(
    eventId: string,
    request: AcknowledgeEventRequest & { tenantId: string },
  ): Promise<void> {
    const all      = await this.deliveries.findByEventId(eventId);
    const delivery = all.find(
      (d) => d.status === 'processing' || d.status === 'awaiting_ack',
    );

    if (!delivery) throw new NotFoundException('EventDelivery for event', eventId);

    if (request.status === 'success') {
      await this.queue.acknowledge(delivery.id);
      return;
    }

    const reason = request.error ?? 'Consumer reported failure';

    if (delivery.retryCount >= this.maxRetryAttempts) {
      await this.queue.moveToDeadLetter(delivery.id, reason);
      return;
    }

    await this.queue.scheduleRetry(delivery.id, this.getRetryDelay(delivery.retryCount));
  }
}
