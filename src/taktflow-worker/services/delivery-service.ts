import { createHash, createHmac } from 'node:crypto';
import { canonicalJson } from '@utils/helpers/canonical-json.helper.js';
import { DELIVERY_HEADERS } from '@infrastructure/constants/delivery-headers.constants.js';
import { tenantContextStore } from '@infrastructure/context/tenant-context-store.js';
import type { ClaimedEvent } from '@domain/types/claimed-event.type.js';

import type { IEventQueueService }  from '@domain/interfaces/event-queue-service.interface.js';
import type { IEventRepository }    from '@domain/interfaces/event-repository.interface.js';
import type { IConsumerRepository } from '@domain/interfaces/consumer-repository.interface.js';
import type { ITopicRepository }    from '@domain/interfaces/topic-repository.interface.js';
import type { LoggerMessages }      from '../extensions/logger-message.extension.js';
import type { WorkerConfig }        from '../config/worker.config.js';
import type { Event }               from '@domain/entities/event.js';
import type { Consumer }            from '@domain/entities/consumer.js';
import type { Topic }               from '@domain/entities/topic.js';
import type { IRetryService }       from '../interfaces/retry-service.interface.js';
import type { IMetricsService }     from '../interfaces/metrics-service.interface.js';
import type { IDeliveryService }    from '../interfaces/delivery-service.interface.js';
import { sleep }                    from '../helpers/sleep.helper.js';

export class DeliveryService implements IDeliveryService {
  private activeDeliveries  = 0;
  private intervalHandle: NodeJS.Timeout | null = null;

  constructor(
    private readonly queue:     IEventQueueService,
    private readonly events:    IEventRepository,
    private readonly consumers: IConsumerRepository,
    private readonly topics:    ITopicRepository,
    private readonly logger:    LoggerMessages,
    private readonly config:    WorkerConfig,
    private readonly retry:     IRetryService,
    private readonly metrics:   IMetricsService,
  ) {}

  start(): void {
    this.intervalHandle = setInterval(() => {
      void this.claimAndDeliver().catch((error: unknown) => {
        this.logger.logWorkerLoopError('delivery', error as Error);
      });
    }, this.config.WORKER_POLL_INTERVAL_MS);
  }

  stop(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }

  async waitForDrain(): Promise<void> {
    let elapsed = 0;
    while (this.activeDeliveries > 0 && elapsed < this.config.WORKER_SHUTDOWN_MAX_WAIT_MS) {
      await sleep(this.config.WORKER_SHUTDOWN_POLL_INTERVAL_MS);
      elapsed += this.config.WORKER_SHUTDOWN_POLL_INTERVAL_MS;
    }
  }

  private async claimAndDeliver(): Promise<void> {
    const deliveries = await this.queue.claim(this.config.WORKER_BATCH_SIZE);
    if (!deliveries.length) return;

    await Promise.all(
      deliveries.map(delivery =>
        tenantContextStore.run({ tenantId: delivery.tenantId }, () => this.deliver(delivery)),
      ),
    );
  }

  private async deliver(delivery: ClaimedEvent): Promise<void> {
    this.activeDeliveries++;
    const startTime = Date.now();
    let consumer: Consumer | null = null;

    try {
      const event = await this.events.findById(delivery.eventId);
      if (!event) return;

      consumer = await this.consumers.findById(delivery.consumerId);
      if (!consumer) {
        await this.queue.moveToDeadLetter(delivery.id, 'consumer_deleted');
        return;
      }

      if (consumer.status === 'paused') {
        await this.queue.releaseToPending(delivery.id);
        return;
      }

      if (consumer.type === 'pull' || consumer.url == null) {
        await this.queue.releaseToPending(delivery.id);
        return;
      }

      const topic = await this.topics.findById(consumer.topicId);

      if (!this.checksumMatches(event)) {
        await this.queue.moveToDeadLetter(delivery.id, 'payload_integrity_check_failed');
        this.logger.logEventMovedToDeadLetter(
          delivery.eventId,
          delivery.consumerId,
          'payload_integrity_check_failed',
        );
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.WORKER_DELIVERY_TIMEOUT_MS,
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
      this.logger.logDeliveryFailed(
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
    delivery: ClaimedEvent,
    consumer: Consumer,
    startTime: number,
  ): Promise<void> {
    const rawBody = await response.text();
    const responseBody = rawBody.substring(0, this.config.WORKER_MAX_RESPONSE_BODY_BYTES);

    if (response.status === 202) {
      await this.queue.markAwaitingAck(delivery.id);
      return;
    }

    if (response.ok) {
      const durationMs = Date.now() - startTime;
      await this.queue.acknowledge(delivery.id, response.status, responseBody);
      this.metrics.recordSuccess(delivery.tenantId, durationMs);
      this.logger.logDeliverySucceeded(delivery.eventId, consumer.id, durationMs);
      return;
    }

    if (response.status >= 400 && response.status < 500) {
      const reason = `HTTP ${response.status}: ${responseBody}`;
      await this.queue.moveToDeadLetter(delivery.id, reason, response.status, responseBody);
      this.metrics.recordFailure(delivery.tenantId);
      this.logger.logEventMovedToDeadLetter(delivery.eventId, consumer.id, reason);
      return;
    }

    await this.retry.scheduleRetryOrDeadLetter(delivery, `HTTP ${response.status}: ${responseBody}`, response.status, responseBody);
  }

  private buildDeliveryHeaders(
    delivery: ClaimedEvent,
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
      'Content-Type':               'application/json',
      [DELIVERY_HEADERS.EVENT_ID]:  event.id,
      [DELIVERY_HEADERS.TOPIC]:     topic?.name ?? event.topicId,
      [DELIVERY_HEADERS.SIGNATURE]: `sha256=${signature}`,
      [DELIVERY_HEADERS.TIMESTAMP]: timestamp,
      [DELIVERY_HEADERS.ATTEMPT]:   String(delivery.attempt),
    };
  }

  private checksumMatches(event: Event): boolean {
    const computed = createHash('sha256')
      .update(canonicalJson(event.payload))
      .digest('hex');
    return computed === event.checksum;
  }
}
