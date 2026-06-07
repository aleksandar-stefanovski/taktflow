import type { WorkerDependencies } from '../interfaces/worker-dependencies.interface.js';
import type { ClaimedDelivery } from '../models/delivery.model.js';
import type { Consumer } from '@domain/entities/consumer.js';

export class RetryService {
  constructor(private readonly deps: WorkerDependencies) {}

  async resetTimedOutAcks(): Promise<void> {
    await this.deps.deliveries.resetTimedOutAcks(this.deps.config.awaitingAckTimeoutHours);
  }

  async releaseStuckDeliveries(): Promise<void> {
    const released = await this.deps.deliveries.releaseStuckDeliveries(this.deps.config.stuckThresholdMs);
    if (released > 0) {
      this.deps.logger.logStuckEventsReleased(released);
    }
  }

  async scheduleRetryOrDeadLetter(
    delivery: ClaimedDelivery,
    reason: string,
    consumer?: Consumer,
  ): Promise<void> {
    const maxAttempts = consumer?.config.retryAttempts ?? this.deps.config.defaultRetryAttempts;

    if (delivery.retry_count >= maxAttempts) {
      await this.deps.queue.moveToDeadLetter(delivery.id, reason);
      this.deps.logger.logEventMovedToDeadLetter(delivery.event_id, delivery.consumer_id, reason);
      return;
    }

    const delayMs = this.deps.config.retryBaseDelayMs * Math.pow(2, delivery.retry_count);
    await this.deps.queue.scheduleRetry(delivery.id, delayMs);
    this.deps.logger.logEventRetryScheduled(delivery.event_id, delayMs, delivery.retry_count);
  }
}
