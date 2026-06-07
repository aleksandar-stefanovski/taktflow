import type { ClaimedEvent } from './claimed-event.interface.js';
import type { EnqueueEventCommand } from './enqueue-event-command.interface.js';

export interface IEventQueueService {
  claimForConsumer(consumerId: string, tenantId: string, limit: number): Promise<ClaimedEvent[]>;
  enqueue(command: EnqueueEventCommand): Promise<void>;
  acknowledge(deliveryId: string): Promise<void>;
  releaseToPending(deliveryId: string): Promise<void>;
  scheduleRetry(deliveryId: string, delayMs: number): Promise<void>;
  moveToDeadLetter(deliveryId: string, reason: string): Promise<void>;
}
