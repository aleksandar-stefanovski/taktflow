import type { IConsumerRepository } from '@domain/interfaces/consumer-repository.interface.js';
import type { IEventDeliveryRepository } from '@domain/interfaces/event-delivery-repository.interface.js';
import { NotFoundException } from '@domain/exceptions/not-found-exception.js';

export interface ConsumerHealth {
  consumerId: string;
  total: number;
  pending: number;
  processing: number;
  delivered: number;
  failed: number;
  deadLetter: number;
}

export class GetConsumerHealthHandler {
  constructor(
    private readonly consumers: IConsumerRepository,
    private readonly deliveries: IEventDeliveryRepository,
  ) {}

  async handle(consumerId: string, tenantId: string): Promise<ConsumerHealth> {
    const consumer = await this.consumers.findById(consumerId, tenantId);
    if (!consumer) throw new NotFoundException('Consumer', consumerId);

    const allDeliveries = await this.deliveries.findByConsumerId(consumerId, tenantId);

    const health: ConsumerHealth = {
      consumerId,
      total:      allDeliveries.length,
      pending:    0,
      processing: 0,
      delivered:  0,
      failed:     0,
      deadLetter: 0,
    };

    for (const delivery of allDeliveries) {
      if (delivery.status === 'pending')     health.pending    += 1;
      if (delivery.status === 'processing')  health.processing += 1;
      if (delivery.status === 'delivered')   health.delivered  += 1;
      if (delivery.status === 'failed')      health.failed     += 1;
      if (delivery.status === 'dead_letter') health.deadLetter += 1;
    }

    return health;
  }
}
