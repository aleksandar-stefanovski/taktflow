import type { Logger } from 'pino';

export function createLoggerExtensions(logger: Logger) {
  return {
    logEventProduced: (eventId: string, topic: string, tenantId: string) =>
      logger.info({ eventId, topic, tenantId }, 'Event produced successfully'),

    logEventProductionFailed: (topic: string, tenantId: string, error: Error) =>
      logger.error({ topic, tenantId, err: error }, 'Failed to produce event'),

    logApiKeyLookupFailed: (keyPrefix: string) =>
      logger.warn({ keyPrefix }, 'API key not found or invalid'),

    logUnauthorizedAccess: (ip: string, path: string) =>
      logger.warn({ ip, path }, 'Unauthorized access attempt'),

    logRateLimitExceeded: (key: string, path: string) =>
      logger.warn({ key, path }, 'Rate limit exceeded'),

    logTopicCreated: (topicId: string, name: string, tenantId: string) =>
      logger.info({ topicId, name, tenantId }, 'Topic created'),

    logConsumerCreated: (consumerId: string, topicId: string) =>
      logger.info({ consumerId, topicId }, 'Consumer registered'),

    logWorkerStarted: () =>
      logger.info('Worker engine started'),

    logWorkerLoopError: (loop: string, error: Error) =>
      logger.error({ loop, err: error }, 'Worker loop encountered error'),

    logDeliveryStarted: (eventId: string, consumerId: string, attempt: number) =>
      logger.debug({ eventId, consumerId, attempt }, 'Delivery attempt started'),

    logDeliverySucceeded: (eventId: string, consumerId: string, durationMs: number) =>
      logger.info({ eventId, consumerId, durationMs }, 'Event delivered successfully'),

    logDeliveryFailed: (eventId: string, consumerId: string, reason: string, attempt: number) =>
      logger.warn({ eventId, consumerId, reason, attempt }, 'Delivery attempt failed'),

    logDeliveryTimedOut: (eventId: string, consumerId: string, timeoutMs: number) =>
      logger.warn({ eventId, consumerId, timeoutMs }, 'Delivery timed out'),

    logEventMovedToDeadLetter: (eventId: string, consumerId: string, reason: string) =>
      logger.error({ eventId, consumerId, reason }, 'Event moved to dead letter queue'),

    logEventRetryScheduled: (eventId: string, delaySeconds: number, attempt: number) =>
      logger.info({ eventId, delaySeconds, attempt }, 'Event retry scheduled'),

    logStuckEventsReleased: (count: number) =>
      logger.info({ count }, 'Released stuck events back to pending'),

    logSchedulerFired: (scheduleId: string, topicId: string, topic: string) =>
      logger.info({ scheduleId, topicId, topic }, 'Scheduled event produced'),

    logSchedulerError: (scheduleId: string, error: Error) =>
      logger.error({ scheduleId, err: error }, 'Scheduler failed to produce event'),

    logPartitionDropped: (partitionName: string) =>
      logger.info({ partitionName }, 'Expired event partition dropped'),

    logAlertSent: (tenantId: string, consumerId: string) =>
      logger.info({ tenantId, consumerId }, 'Failure alert sent to customer'),
  };
}

export type LoggerExtensions = ReturnType<typeof createLoggerExtensions>;
