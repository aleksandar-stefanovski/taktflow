import type { EventDelivery } from '@domain/entities/event-delivery.js';
import type { IEventDeliveryReadRepository } from './readonly/event-delivery-read-repository.interface.js';
import type { IEntityBaseRepository } from './entity-base-repository.interface.js';

export interface IEventDeliveryRepository
  extends IEventDeliveryReadRepository,
    IEntityBaseRepository<EventDelivery> {
  resetTimedOutAcks(awaitingAckTimeoutHours: number): Promise<void>;
  releaseStuckDeliveries(stuckThresholdMs: number): Promise<number>;
}
