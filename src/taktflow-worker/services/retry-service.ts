import type { WorkerDependencies } from '../interfaces/worker-dependencies.interface.js';
import type { ClaimedDelivery } from '../models/delivery.model.js';
import type { Consumer } from '@domain/entities/consumer.js';

export class RetryService {
  constructor(private readonly deps: WorkerDependencies) {}

  async resetTimedOutAcks(): Promise<void> {
    await this.deps.deliveries.resetTimedOutAcks(this.deps.config.awaitingAckTimeoutHours);
  }

  async releaseStuckDeliveries(): Promise<void> {
    const released = await this.deps.deliveries.releaseStuckDeliveries(this.deps.config.stuckThresholdSeconds);
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

    const delays = this.deps.config.retryDelaysSeconds;
    const delaySeconds = delays[delivery.retry_count] ?? delays[delays.length - 1] ?? 3600;
    await this.deps.queue.scheduleRetry(delivery.id, delaySeconds);
    this.deps.logger.logEventRetryScheduled(delivery.event_id, delaySeconds, delivery.retry_count);
  }
}
