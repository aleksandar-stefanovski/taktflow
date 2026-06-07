import { randomBytes } from 'crypto';

import type { IConsumerRepository } from '@domain/interfaces/consumer-repository.interface.js';
import type { ITopicRepository } from '@domain/interfaces/topic-repository.interface.js';
import { Consumer } from '@domain/entities/consumer.js';
import { NotFoundException } from '@domain/exceptions/not-found-exception.js';

import type { CreatePushConsumerRequest } from '../requests/consumers/create-push-consumer.request.js';

export class CreatePushConsumerHandler {
  constructor(
    private readonly consumers: IConsumerRepository,
    private readonly topics: ITopicRepository,
  ) {}

  async handle(request: CreatePushConsumerRequest & { tenantId: string }): Promise<Consumer> {
    const topic = await this.topics.findById(request.topicId, request.tenantId);
    if (!topic) throw new NotFoundException('Topic', request.topicId);

    const secret = randomBytes(32).toString('hex');

    const consumer = new Consumer({
      tenantId:    request.tenantId,
      topicId:     request.topicId,
      name:        request.name,
      type:        'push',
      url:         request.url,
      secret,
      environment: request.environment,
      config:      { alertEmail: request.alertEmail ?? null },
    });

    return this.consumers.create(consumer);
  }
}
