import { createHash, createHmac } from 'crypto';
import { canonicalJson } from '@utils/canonical-json.helper.js';

import type { WorkerDependencies } from '../interfaces/worker-dependencies.interface.js';
import type { ClaimedDelivery } from '../models/delivery.model.js';
import type { Event } from '@domain/entities/event.js';
import type { Consumer } from '@domain/entities/consumer.js';
import type { Topic } from '@domain/entities/topic.js';
import type { RetryService } from './retry-service.js';
import type { MetricsService } from './metrics-service.js';
import { PIPELINE_HEADERS } from '@types/header-constants.js';

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
    // NOTE: raw SQL required — Drizzle does not support FOR UPDATE SKIP LOCKED
    const result = await this.deps.pool.query<ClaimedDelivery>(`
      UPDATE event_deliveries
      SET status = 'processing', started_at = NOW()
      WHERE id IN (
        SELECT id FROM event_deliveries
        WHERE status = 'pending'
        AND scheduled_at <= NOW()
        ORDER BY scheduled_at ASC
        FOR UPDATE SKIP LOCKED
        LIMIT $1
      )
      RETURNING id, event_id, tenant_id, consumer_id, retry_count, scheduled_at, started_at
    `, [this.deps.config.batchSize]);

    if (!result.rows.length) return;

    await Promise.all(result.rows.map(delivery => this.deliver(delivery)));
  }

  private async deliver(delivery: ClaimedDelivery): Promise<void> {
    this.activeDeliveries++;
    const startTime = Date.now();
    let consumer: Consumer | null = null;

    try {
      const event = await this.deps.events.findById(delivery.event_id, delivery.tenant_id);
      if (!event) return;

      consumer = await this.deps.consumers.findById(delivery.consumer_id, delivery.tenant_id);
      if (!consumer) {
        await this.deps.queue.moveToDeadLetter(delivery.id, 'consumer_deleted');
        return;
      }

      if (consumer.status === 'paused') {
        await this.deps.queue.releaseToPending(delivery.id);
        return;
      }

      const topic = await this.deps.topics.findById(consumer.topicId, delivery.tenant_id);

      if (!this.checksumMatches(event)) {
        await this.deps.queue.moveToDeadLetter(delivery.id, 'payload_integrity_check_failed');
        this.deps.logger.logEventMovedToDeadLetter(
          delivery.event_id,
          delivery.consumer_id,
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
        delivery.event_id,
        delivery.consumer_id,
        reason,
        delivery.retry_count,
      );
      await this.retry.scheduleRetryOrDeadLetter(delivery, reason, consumer ?? undefined);
    } finally {
      this.activeDeliveries--;
    }
  }

  private async handleResponse(
    response: Response,
    delivery: ClaimedDelivery,
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
      this.metrics.recordSuccess(delivery.tenant_id, durationMs);
      this.deps.logger.logDeliverySucceeded(delivery.event_id, consumer.id, durationMs);
      return;
    }

    if (response.status >= 400 && response.status < 500) {
      const reason = `HTTP ${response.status}: ${responseBody}`;
      await this.deps.queue.moveToDeadLetter(delivery.id, reason);
      this.deps.logger.logEventMovedToDeadLetter(delivery.event_id, consumer.id, reason);
      return;
    }

    await this.retry.scheduleRetryOrDeadLetter(delivery, `HTTP ${response.status}: ${responseBody}`, consumer);
  }

  private buildDeliveryHeaders(
    delivery: ClaimedDelivery,
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
      [PIPELINE_HEADERS.EVENT_ID]:     event.id,
      [PIPELINE_HEADERS.TOPIC]:        topic?.name ?? event.topicId,
      [PIPELINE_HEADERS.SIGNATURE]:    `sha256=${signature}`,
      [PIPELINE_HEADERS.TIMESTAMP]:    timestamp,
      [PIPELINE_HEADERS.ATTEMPT]:      String(delivery.retry_count),
    };
  }

  private checksumMatches(event: Event): boolean {
    const computed = createHash('sha256')
      .update(canonicalJson(event.payload))
      .digest('hex');
    return computed === event.checksum;
  }
}
