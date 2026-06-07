import type { QueuedEvent } from './queued-event.interface.js';

export interface IQueueEngine {
  enqueue(event: QueuedEvent): Promise<void>;
  claim(limit: number): Promise<QueuedEvent[]>;
  claimForConsumer(consumerId: string, tenantId: string, limit: number): Promise<QueuedEvent[]>;
  acknowledge(deliveryId: string): Promise<void>;
  markAwaitingAck(deliveryId: string): Promise<void>;
  releaseToPending(deliveryId: string): Promise<void>;
  scheduleRetry(deliveryId: string, delayMs: number): Promise<void>;
  moveToDeadLetter(deliveryId: string, reason: string): Promise<void>;
}
