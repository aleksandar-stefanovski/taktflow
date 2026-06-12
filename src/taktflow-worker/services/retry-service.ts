import type { WorkerDependencies } from '../interfaces/worker-dependencies.interface.js';
import type { QueuedEvent } from '@infrastructure/interfaces/queued-event.interface.js';

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
    delivery: QueuedEvent,
    reason: string,
  ): Promise<void> {
    const maxAttempts = this.deps.config.defaultRetryAttempts;

    if (delivery.attempt >= maxAttempts) {
      await this.deps.queue.moveToDeadLetter(delivery.id, reason);
      this.deps.logger.logEventMovedToDeadLetter(delivery.eventId, delivery.consumerId, reason);
      return;
    }

    const delayMs = this.deps.config.retryBaseDelayMs * Math.pow(2, delivery.attempt);
    await this.deps.queue.scheduleRetry(delivery.id, delayMs);
    this.deps.logger.logEventRetryScheduled(delivery.eventId, delayMs, delivery.attempt);
  }
}
