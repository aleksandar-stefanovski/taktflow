import type { EventDelivery } from '../entities/event-delivery.js';
import type { ITenantRepository } from './tenant-repository.interface.js';

export interface IEventDeliveryRepository extends ITenantRepository<EventDelivery> {
  findByEventId(eventId: string, tenantId: string): Promise<EventDelivery[]>;
  findByConsumerId(consumerId: string, tenantId: string): Promise<EventDelivery[]>;
  resetTimedOutAcks(awaitingAckTimeoutHours: number): Promise<void>;
  releaseStuckDeliveries(stuckThresholdMs: number): Promise<number>;
}
