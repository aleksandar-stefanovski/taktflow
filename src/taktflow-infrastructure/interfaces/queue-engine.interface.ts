export interface QueuedEvent {
  id: string;
  eventId: string;
  tenantId: string;
  topicId: string;
  consumerId: string;
  payload: Record<string, unknown>;
  attempt: number;
  scheduledAt: Date;
}

export interface IQueueEngine {
  enqueue(event: QueuedEvent): Promise<void>;
  claim(limit: number): Promise<QueuedEvent[]>;
  claimForConsumer(consumerId: string, tenantId: string, limit: number): Promise<QueuedEvent[]>;
  acknowledge(deliveryId: string): Promise<void>;
  markAwaitingAck(deliveryId: string): Promise<void>;
  releaseToPending(deliveryId: string): Promise<void>;
  scheduleRetry(deliveryId: string, delaySeconds: number): Promise<void>;
  moveToDeadLetter(deliveryId: string, reason: string): Promise<void>;
}
