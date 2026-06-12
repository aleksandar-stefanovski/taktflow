import { createHash, createHmac } from 'node:crypto';
import { canonicalJson } from '@application/helpers/canonical-json.helper.js';
import { DELIVERY_HEADERS } from '@infrastructure/constants/delivery-headers.constants.js';
import { tenantContextStore } from '@infrastructure/context/tenant-context-store.js';
import type { QueuedEvent } from '@infrastructure/interfaces/queued-event.interface.js';

import type { WorkerDependencies } from '../interfaces/worker-dependencies.interface.js';
import type { Event } from '@domain/entities/event.js';
import type { Consumer } from '@domain/entities/consumer.js';
import type { Topic } from '@domain/entities/topic.js';
import type { RetryService } from './retry-service.js';
import type { MetricsService } from './metrics-service.js';

export class DeliveryService {
  private activeDeliveries = 0;

  constructor(
    private readonly deps: WorkerDependencies,
    private readonly retry: RetryService,
    private readonly metrics: MetricsService,
  ) {}

  getActiveDeliveries(): number {
    return this.activeDeliveries;
  }

  async claimAndDeliver(): Promise<void> {
    const deliveries = await this.deps.queue.claim(this.deps.config.batchSize);
    if (!deliveries.length) return;

    await Promise.all(
      deliveries.map(delivery =>
        tenantContextStore.run({ tenantId: delivery.tenantId }, () => this.deliver(delivery)),
      ),
    );
  }

  private async deliver(delivery: QueuedEvent): Promise<void> {
    this.activeDeliveries++;
    const startTime = Date.now();
    let consumer: Consumer | null = null;

    try {
      const event = await this.deps.events.findById(delivery.eventId);
      if (!event) return;

      consumer = await this.deps.consumers.findById(delivery.consumerId);
      if (!consumer) {
        await this.deps.queue.moveToDeadLetter(delivery.id, 'consumer_deleted');
        return;
      }

      if (consumer.status === 'paused') {
        await this.deps.queue.releaseToPending(delivery.id);
        return;
      }

      if (consumer.type === 'pull' || consumer.url == null) {
        await this.deps.queue.releaseToPending(delivery.id);
        return;
      }

      const topic = await this.deps.topics.findById(consumer.topicId);

      if (!this.checksumMatches(event)) {
        await this.deps.queue.moveToDeadLetter(delivery.id, 'payload_integrity_check_failed');
        this.deps.logger.logEventMovedToDeadLetter(
          delivery.eventId,
          delivery.consumerId,
          'payload_integrity_check_failed',
        );
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.deps.config.deliveryTimeoutMs,
      );

      try {
        const response = await fetch(consumer.url, {
          method:  'POST',
          headers: this.buildDeliveryHeaders(delivery, event, consumer, topic),
          body:    JSON.stringify(event.payload),
          signal:  controller.signal,
        });

        await this.handleResponse(response, delivery, consumer, startTime);
      } finally {
        clearTimeout(timeoutId);
      }

    } catch (error) {
      const reason = error instanceof Error ? error.message : 'unknown error';
      this.deps.logger.logDeliveryFailed(
        delivery.eventId,
        delivery.consumerId,
        reason,
        delivery.attempt,
      );
      await this.retry.scheduleRetryOrDeadLetter(delivery, reason);
    } finally {
      this.activeDeliveries--;
    }
  }

  private async handleResponse(
    response: Response,
    delivery: QueuedEvent,
    consumer: Consumer,
    startTime: number,
  ): Promise<void> {
    const rawBody = await response.text();
    const responseBody = rawBody.substring(0, this.deps.config.maxResponseBodyBytes);

    if (response.status === 202) {
      await this.deps.queue.markAwaitingAck(delivery.id);
      return;
    }

    if (response.ok) {
      const durationMs = Date.now() - startTime;
      await this.deps.queue.acknowledge(delivery.id);
      this.metrics.recordSuccess(delivery.tenantId, durationMs);
      this.deps.logger.logDeliverySucceeded(delivery.eventId, consumer.id, durationMs);
      return;
    }

    if (response.status >= 400 && response.status < 500) {
      const reason = `HTTP ${response.status}: ${responseBody}`;
      await this.deps.queue.moveToDeadLetter(delivery.id, reason);
      this.deps.logger.logEventMovedToDeadLetter(delivery.eventId, consumer.id, reason);
      return;
    }

    await this.retry.scheduleRetryOrDeadLetter(delivery, `HTTP ${response.status}: ${responseBody}`);
  }

  private buildDeliveryHeaders(
    delivery: QueuedEvent,
    event: Event,
    consumer: Consumer,
    topic: Topic | null,
  ): Record<string, string> {
    const timestamp = Date.now().toString();
    const body = JSON.stringify(event.payload);
    const signature = createHmac('sha256', consumer.secret)
      .update(`${timestamp}.${body}`)
      .digest('hex');

    return {
      'Content-Type':                  'application/json',
      [DELIVERY_HEADERS.EVENT_ID]:     event.id,
      [DELIVERY_HEADERS.TOPIC]:        topic?.name ?? event.topicId,
      [DELIVERY_HEADERS.SIGNATURE]:    `sha256=${signature}`,
      [DELIVERY_HEADERS.TIMESTAMP]:    timestamp,
      [DELIVERY_HEADERS.ATTEMPT]:      String(delivery.attempt),
    };
  }

  private checksumMatches(event: Event): boolean {
    const computed = createHash('sha256')
      .update(canonicalJson(event.payload))
      .digest('hex');
    return computed === event.checksum;
  }
}
