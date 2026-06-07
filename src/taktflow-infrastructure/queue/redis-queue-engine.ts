import type { Redis } from 'ioredis';
import type { IQueueEngine } from '../interfaces/queue-engine.interface.js';
import type { QueuedEvent } from '../interfaces/queued-event.interface.js';
import { QUEUE_KEYS } from '../constants/queue-keys.constants.js';

type StreamMessages = [string, [string, string[]][]][];

export class RedisQueueEngine implements IQueueEngine {
  constructor(
    private readonly redis: Redis,
    private readonly consumerName: string,
  ) {}

  async enqueue(event: QueuedEvent): Promise<void> {
    await this.redis.hset(
      `${QUEUE_KEYS.DELIVERY_PREFIX}${event.id}`,
      'event_id',    event.eventId,
      'tenant_id',   event.tenantId,
      'topic_id',    event.topicId,
      'consumer_id', event.consumerId,
      'payload',     JSON.stringify(event.payload),
      'attempt',     String(event.attempt),
      'scheduled_at', event.scheduledAt.toISOString(),
    );
    await this.redis.xadd(QUEUE_KEYS.STREAM, '*', 'delivery_id', event.id);
  }

  async claim(limit: number): Promise<QueuedEvent[]> {
    await this.promoteRetryQueue();
    await this.ensureGroup();

    const raw = await this.redis.xreadgroup(
      'GROUP', QUEUE_KEYS.GROUP, this.consumerName,
      'COUNT', String(limit),
      'STREAMS', QUEUE_KEYS.STREAM, '>',
    ) as StreamMessages | null;

    if (!raw) return [];

    const deliveries: QueuedEvent[] = [];

    for (const [, messages] of raw) {
      for (const [streamId, fields] of messages) {
        const deliveryId = this.extractField(fields, 'delivery_id');
        if (!deliveryId) continue;

        const data = await this.redis.hgetall(`${QUEUE_KEYS.DELIVERY_PREFIX}${deliveryId}`);
        if (!data['event_id']) continue;

        await this.redis.hset(`${QUEUE_KEYS.DELIVERY_PREFIX}${deliveryId}`, 'stream_id', streamId);

        deliveries.push({
          id:          deliveryId,
          eventId:     data['event_id'],
          tenantId:    data['tenant_id'] ?? '',
          topicId:     data['topic_id'] ?? '',
          consumerId:  data['consumer_id'] ?? '',
          payload:     JSON.parse(data['payload'] ?? '{}') as Record<string, unknown>,
          attempt:     Number(data['attempt'] ?? '0'),
          scheduledAt: new Date(data['scheduled_at'] ?? Date.now()),
        });
      }
    }

    return deliveries;
  }

  async acknowledge(deliveryId: string): Promise<void> {
    const streamId = await this.redis.hget(`${QUEUE_KEYS.DELIVERY_PREFIX}${deliveryId}`, 'stream_id');
    if (streamId) {
      await this.redis.xack(QUEUE_KEYS.STREAM, QUEUE_KEYS.GROUP, streamId);
    }
    await this.redis.del(`${QUEUE_KEYS.DELIVERY_PREFIX}${deliveryId}`);
  }

  async markAwaitingAck(deliveryId: string): Promise<void> {
    await this.redis.hset(`${QUEUE_KEYS.DELIVERY_PREFIX}${deliveryId}`, 'status', 'awaiting_ack');
  }

  async scheduleRetry(deliveryId: string, delayMs: number): Promise<void> {
    const streamId = await this.redis.hget(`${QUEUE_KEYS.DELIVERY_PREFIX}${deliveryId}`, 'stream_id');
    if (streamId) {
      await this.redis.xack(QUEUE_KEYS.STREAM, QUEUE_KEYS.GROUP, streamId);
    }

    const currentAttempt = Number(
      await this.redis.hget(`${QUEUE_KEYS.DELIVERY_PREFIX}${deliveryId}`, 'attempt') ?? '0',
    );
    const scheduledAt = Date.now() + delayMs;

    await this.redis.hset(
      `${QUEUE_KEYS.DELIVERY_PREFIX}${deliveryId}`,
      'attempt',      String(currentAttempt + 1),
      'scheduled_at', new Date(scheduledAt).toISOString(),
    );

    await this.redis.zadd(QUEUE_KEYS.RETRY, scheduledAt, deliveryId);
  }

  async moveToDeadLetter(deliveryId: string, reason: string): Promise<void> {
    const data = await this.redis.hgetall(`${QUEUE_KEYS.DELIVERY_PREFIX}${deliveryId}`);

    if (data['stream_id']) {
      await this.redis.xack(QUEUE_KEYS.STREAM, QUEUE_KEYS.GROUP, data['stream_id']);
    }

    await this.redis.xadd(
      QUEUE_KEYS.DLQ, '*',
      'delivery_id', deliveryId,
      'event_id',    data['event_id'] ?? '',
      'tenant_id',   data['tenant_id'] ?? '',
      'consumer_id', data['consumer_id'] ?? '',
      'reason',      reason,
      'payload',     data['payload'] ?? '{}',
      'failed_at',   new Date().toISOString(),
    );

    await this.redis.del(`${QUEUE_KEYS.DELIVERY_PREFIX}${deliveryId}`);
  }

  private async ensureGroup(): Promise<void> {
    try {
      await this.redis.xgroup('CREATE', QUEUE_KEYS.STREAM, QUEUE_KEYS.GROUP, '0', 'MKSTREAM');
    } catch (error) {
      if (!(error instanceof Error) || !error.message.startsWith('BUSYGROUP')) {
        throw error;
      }
    }
  }

  private async promoteRetryQueue(): Promise<void> {
    const now = Date.now();
    const due = await this.redis.zrangebyscore(QUEUE_KEYS.RETRY, 0, now);
    if (!due.length) return;

    for (const deliveryId of due) {
      await this.redis.xadd(QUEUE_KEYS.STREAM, '*', 'delivery_id', deliveryId);
    }
    await this.redis.zrem(QUEUE_KEYS.RETRY, ...due);
  }

  private extractField(fields: string[], name: string): string | undefined {
    const index = fields.indexOf(name);
    return index !== -1 ? fields[index + 1] : undefined;
  }
}
