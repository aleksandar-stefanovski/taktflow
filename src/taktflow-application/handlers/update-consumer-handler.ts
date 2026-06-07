import type { IConsumerRepository } from '@domain/interfaces/consumer-repository.interface.js';
import { Consumer } from '@domain/entities/consumer.js';
import { NotFoundException } from '@domain/exceptions/not-found-exception.js';
import { ValidationException } from '@domain/exceptions/validation-exception.js';

import type { UpdateConsumerRequest } from '../requests/consumers/update-consumer.request.js';

export class UpdateConsumerHandler {
  constructor(private readonly consumers: IConsumerRepository) {}

  async handle(id: string, request: UpdateConsumerRequest & { tenantId: string }): Promise<Consumer> {
    const consumer = await this.consumers.findById(id, request.tenantId);
    if (!consumer) throw new NotFoundException('Consumer', id);

    if (request.url !== undefined && consumer.type === 'pull') {
      throw new ValidationException('Pull consumers do not have a URL');
    }

    const mergedConfig = request.alertEmail !== undefined
      ? { ...consumer.config, alertEmail: request.alertEmail }
      : undefined;

    return this.consumers.update(id, request.tenantId, {
      ...(request.name !== undefined && { name: request.name }),
      ...(request.url !== undefined && { url: request.url }),
      ...(mergedConfig !== undefined && { config: mergedConfig }),
    });
  }
}
