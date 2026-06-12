import type { EventDelivery } from '@domain/entities/event-delivery.js';
import type { IEntityBaseReadonlyRepository } from './entity-base-readonly-repository.interface.js';

export interface IEventDeliveryReadRepository extends IEntityBaseReadonlyRepository<EventDelivery> {
  findByEventId(eventId: string): Promise<EventDelivery[]>;
  findByConsumerId(consumerId: string): Promise<EventDelivery[]>;
}
