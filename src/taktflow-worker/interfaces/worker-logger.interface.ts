export interface IWorkerLogger {
  logWorkerStarted(): void;
  logWorkerLoopError(loop: string, error: Error): void;
  logDeliveryStarted(eventId: string, consumerId: string, attempt: number): void;
  logDeliverySucceeded(eventId: string, consumerId: string, durationMs: number): void;
  logDeliveryFailed(eventId: string, consumerId: string, reason: string, attempt: number): void;
  logDeliveryTimedOut(eventId: string, consumerId: string, timeoutMs: number): void;
  logEventMovedToDeadLetter(eventId: string, consumerId: string, reason: string): void;
  logEventRetryScheduled(eventId: string, delaySeconds: number, attempt: number): void;
  logStuckEventsReleased(count: number): void;
  logSchedulerFired(scheduleId: string, topicId: string, cron: string): void;
  logSchedulerError(scheduleId: string, error: Error): void;
  logPartitionDropped(partitionName: string): void;
  logAlertSent(tenantId: string, consumerId: string): void;
  logHighMemoryUsage(usedMb: number): void;
}
