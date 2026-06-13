import type { Logger } from 'pino';

export function createLoggerMessages(logger: Logger) {
  return {
    logWorkerStarted: () =>
      logger.info('Worker started'),

    logWorkerStopping: () =>
      logger.info('Worker stopping'),

    logWorkerStopped: () =>
      logger.info('Worker stopped'),

    logWorkerLoopError: (loop: string, error: Error) =>
      logger.error({ loop, err: error }, 'Worker loop encountered error'),

    logDeliverySucceeded: (eventId: string, consumerId: string, durationMs: number) =>
      logger.debug({ eventId, consumerId, durationMs }, 'Event delivered successfully'),

    logDeliveryFailed: (eventId: string, consumerId: string, reason: string, attempt: number) =>
      logger.warn({ eventId, consumerId, reason, attempt }, 'Delivery attempt failed'),

    logEventMovedToDeadLetter: (eventId: string, consumerId: string, reason: string) =>
      logger.error({ eventId, consumerId, reason }, 'Event moved to dead letter queue'),

    logEventRetryScheduled: (eventId: string, delayMs: number, attempt: number) =>
      logger.info({ eventId, delayMs, attempt }, 'Event retry scheduled'),

    logStuckEventsReleased: (count: number) =>
      logger.info({ count }, 'Released stuck events back to pending'),

    logSchedulerFired: (scheduleId: string, topicId: string, cron: string) =>
      logger.info({ scheduleId, topicId, cron }, 'Scheduled event produced'),

    logSchedulerError: (scheduleId: string, error: Error) =>
      logger.error({ scheduleId, err: error }, 'Scheduler failed to produce event'),

    logPartitionDropped: (partitionName: string) =>
      logger.info({ partitionName }, 'Expired event partition dropped'),
  };
}

export type LoggerMessages = ReturnType<typeof createLoggerMessages>;
