import type { ClaimedEvent } from '@domain/types/claimed-event.type.js';

export interface IEventQueueService {
  enqueue(event: ClaimedEvent): Promise<void>;
  claim(limit: number): Promise<ClaimedEvent[]>;
  claimForConsumer(consumerId: string, tenantId: string, limit: number): Promise<ClaimedEvent[]>;
  acknowledge(deliveryId: string, responseStatus?: number, responseBody?: string): Promise<void>;
  markAwaitingAck(deliveryId: string): Promise<void>;
  releaseToPending(deliveryId: string): Promise<void>;
  scheduleRetry(deliveryId: string, delayMs: number): Promise<void>;
  moveToDeadLetter(deliveryId: string, reason: string, responseStatus?: number, responseBody?: string): Promise<void>;
}
