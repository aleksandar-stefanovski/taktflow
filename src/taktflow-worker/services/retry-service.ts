import { calcRetryDelay } from '@taktflow/utils/helpers/retry.helper.js';

import type { IEventDeliveryRepository } from '@taktflow/domain/interfaces/event-delivery-repository.interface.js';
import type { IEventQueueService }       from '@taktflow/domain/interfaces/event-queue-service.interface.js';
import type { LoggerMessages }           from '../extensions/logger-message.extension.js';
import type { WorkerConfig }             from '../config/worker.config.js';
import type { ClaimedEvent }             from '@taktflow/domain/types/claimed-event.type.js';
import type { IMetricsService }          from '../interfaces/metrics-service.interface.js';
import type { IRetryService }            from '../interfaces/retry-service.interface.js';
import { RecurringTask }                 from '../helpers/recurring-task.helper.js';

export class RetryService implements IRetryService {
  private readonly resetTask:   RecurringTask;
  private readonly unstuckTask: RecurringTask;

  constructor(
    private readonly deliveries: IEventDeliveryRepository,
    private readonly queue:      IEventQueueService,
    private readonly logger:     LoggerMessages,
    private readonly config:     WorkerConfig,
    private readonly metrics:    IMetricsService,
  ) {
    this.resetTask = new RecurringTask(
      this.config.WORKER_RETRY_INTERVAL_MS,
      () => this.resetTimedOutAcks(),
      error => this.logger.logWorkerLoopError('retry', error),
    );
    this.unstuckTask = new RecurringTask(
      this.config.WORKER_UNSTUCK_INTERVAL_MS,
      () => this.releaseStuckDeliveries(),
      error => this.logger.logWorkerLoopError('unstuck', error),
    );
  }

  start(): void {
    this.resetTask.start();
    this.unstuckTask.start();
  }

  async stop(): Promise<void> {
    await Promise.all([this.resetTask.stop(), this.unstuckTask.stop()]);
  }

  async scheduleRetryOrDeadLetter(
    delivery: ClaimedEvent,
    reason: string,
    responseStatus?: number,
    responseBody?: string,
  ): Promise<void> {
    if (delivery.attempt >= this.config.WORKER_DEFAULT_RETRY_ATTEMPTS) {
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
