export interface ClaimedEvent {
  id:          string;
  eventId:     string;
  tenantId:    string;
  topicId:     string;
  consumerId:  string;
  payload:     Record<string, unknown>;
  attempt:     number;
  scheduledAt: Date;
}

export interface EnqueueEventCommand {
  id:          string;
  eventId:     string;
  tenantId:    string;
  topicId:     string;
  consumerId:  string;
  payload:     Record<string, unknown>;
  attempt:     number;
  scheduledAt: Date;
}

export interface IEventQueueService {
  claimForConsumer(consumerId: string, tenantId: string, limit: number): Promise<ClaimedEvent[]>;
  enqueue(command: EnqueueEventCommand): Promise<void>;
  acknowledge(deliveryId: string): Promise<void>;
  releaseToPending(deliveryId: string): Promise<void>;
  scheduleRetry(deliveryId: string, delaySeconds: number): Promise<void>;
  moveToDeadLetter(deliveryId: string, reason: string): Promise<void>;
}
