import { calcRetryDelay } from '@utils/helpers/retry.helper.js';

import type { IEventDeliveryRepository } from '@domain/interfaces/event-delivery-repository.interface.js';
import type { IEventQueueService }       from '@domain/interfaces/event-queue-service.interface.js';
import type { LoggerMessages }           from '../extensions/logger-message.extension.js';
import type { WorkerConfig }             from '../config/worker.config.js';
import type { ClaimedEvent }             from '@domain/types/claimed-event.type.js';
import type { IMetricsService }          from '../interfaces/metrics-service.interface.js';
import type { IRetryService }            from '../interfaces/retry-service.interface.js';

export class RetryService implements IRetryService {
  private retryIntervalHandle:  NodeJS.Timeout | null = null;
  private unstuckIntervalHandle: NodeJS.Timeout | null = null;

  constructor(
    private readonly deliveries: IEventDeliveryRepository,
    private readonly queue:      IEventQueueService,
    private readonly logger:     LoggerMessages,
    private readonly config:     WorkerConfig,
    private readonly metrics:    IMetricsService,
  ) {}

  start(): void {
    this.retryIntervalHandle = setInterval(() => {
      void this.resetTimedOutAcks().catch((error: unknown) => {
        this.logger.logWorkerLoopError('retry', error as Error);
      });
    }, this.config.WORKER_RETRY_INTERVAL_MS);

    this.unstuckIntervalHandle = setInterval(() => {
      void this.releaseStuckDeliveries().catch((error: unknown) => {
        this.logger.logWorkerLoopError('unstuck', error as Error);
      });
    }, this.config.WORKER_UNSTUCK_INTERVAL_MS);
  }

  stop(): void {
    if (this.retryIntervalHandle) {
      clearInterval(this.retryIntervalHandle);
      this.retryIntervalHandle = null;
    }
    if (this.unstuckIntervalHandle) {
      clearInterval(this.unstuckIntervalHandle);
      this.unstuckIntervalHandle = null;
    }
  }

  async scheduleRetryOrDeadLetter(
    delivery: ClaimedEvent,
    reason: string,
    responseStatus?: number,
    responseBody?: string,
  ): Promise<void> {
    const maxAttempts = this.config.WORKER_DEFAULT_RETRY_ATTEMPTS;

    if (delivery.attempt >= maxAttempts) {
      await this.queue.moveToDeadLetter(delivery.id, reason, responseStatus, responseBody);
      this.metrics.recordFailure(delivery.tenantId);
      this.logger.logEventMovedToDeadLetter(delivery.eventId, delivery.consumerId, reason);
      return;
    }

    const delayMs = calcRetryDelay(delivery.attempt, this.config.RETRY_BASE_DELAY_MS);
    await this.queue.scheduleRetry(delivery.id, delayMs);
    this.logger.logEventRetryScheduled(delivery.eventId, delayMs, delivery.attempt);
  }

  private async resetTimedOutAcks(): Promise<void> {
    await this.deliveries.resetTimedOutAcks(this.config.WORKER_AWAITING_ACK_TIMEOUT_HOURS);
  }

  private async releaseStuckDeliveries(): Promise<void> {
    const released = await this.deliveries.releaseStuckDeliveries(this.config.WORKER_STUCK_THRESHOLD_MS);
    if (released > 0) {
      this.logger.logStuckEventsReleased(released);
    }
  }
}
