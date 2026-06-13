import { createHash, createHmac } from 'node:crypto';
import { canonicalJson } from '@taktflow/utils/helpers/canonical-json.helper.js';
import { DELIVERY_HEADERS } from '@taktflow/infra/constants/delivery-headers.constants.js';
import { tenantContextStore } from '@taktflow/infra/context/tenant-context-store.js';
import type { ClaimedEvent } from '@taktflow/domain/types/claimed-event.type.js';

import type { IEventQueueService }  from '@taktflow/domain/interfaces/event-queue-service.interface.js';
import type { IEventRepository }    from '@taktflow/domain/interfaces/event-repository.interface.js';
import type { IConsumerRepository } from '@taktflow/domain/interfaces/consumer-repository.interface.js';
import type { ITopicRepository }    from '@taktflow/domain/interfaces/topic-repository.interface.js';
import type { LoggerMessages }      from '../extensions/logger-message.extension.js';
import type { WorkerConfig }        from '../config/worker.config.js';
import type { Event }               from '@taktflow/domain/entities/event.js';
import type { Consumer }            from '@taktflow/domain/entities/consumer.js';
import type { Topic }               from '@taktflow/domain/entities/topic.js';
import type { IRetryService }       from '../interfaces/retry-service.interface.js';
import type { IMetricsService }     from '../interfaces/metrics-service.interface.js';
import type { IDeliveryService }    from '../interfaces/delivery-service.interface.js';
import { RecurringTask }            from '../helpers/recurring-task.helper.js';

export class DeliveryService implements IDeliveryService {
  private readonly task: RecurringTask;

  constructor(
    private readonly queue:     IEventQueueService,
    private readonly events:    IEventRepository,
    private readonly consumers: IConsumerRepository,
    private readonly topics:    ITopicRepository,
    private readonly logger:    LoggerMessages,
    private readonly config:    WorkerConfig,
    private readonly retry:     IRetryService,
    private readonly metrics:   IMetricsService,
  ) {
    this.task = new RecurringTask(
      this.config.WORKER_POLL_INTERVAL_MS,
      () => this.claimAndDeliver(),
      error => this.logger.logWorkerLoopError('delivery', error),
    );
  }

  start(): void {
    this.task.start();
  }

  stop(): Promise<void> {
    return this.task.stop();
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
    const startTime = Date.now();

    try {
      const event = await this.events.findById(delivery.eventId);
      if (!event) return;

      const consumer = await this.consumers.findById(delivery.consumerId);
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

      if (!this.checksumMatches(event)) {
        await this.queue.moveToDeadLetter(delivery.id, 'payload_integrity_check_failed');
        this.logger.logEventMovedToDeadLetter(
          delivery.eventId,
          delivery.consumerId,
          'payload_integrity_check_failed',
        );
        return;
      }

      const topic = await this.topics.findById(consumer.topicId);
      const body  = JSON.stringify(event.payload);

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.WORKER_DELIVERY_TIMEOUT_MS,
      );

      try {
        const response = await fetch(consumer.url, {
          method:  'POST',
          headers: this.buildDeliveryHeaders(delivery, event, consumer, topic, body),
          body,
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

    await this.retry.scheduleRetryOrDeadLetter(
      delivery,
      `HTTP ${response.status}: ${responseBody}`,
      response.status,
      responseBody,
    );
  }

  private buildDeliveryHeaders(
    delivery: ClaimedEvent,
    event: Event,
    consumer: Consumer,
    topic: Topic | null,
    body: string,
  ): Record<string, string> {
    const timestamp = Date.now().toString();
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
