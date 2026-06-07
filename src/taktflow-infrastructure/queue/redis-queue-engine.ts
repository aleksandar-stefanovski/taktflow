import type { Redis } from 'ioredis';
import type { IQueueEngine, QueuedEvent } from '../interfaces/queue-engine.interface.js';

const STREAM_KEY  = 'taktflow:events';
const RETRY_KEY   = 'taktflow:retry-queue';
const DLQ_KEY     = 'taktflow:dlq';
const GROUP_NAME  = 'taktflow-workers';
const DELIVERY_KEY_PREFIX = 'taktflow:delivery:';

type StreamMessages = [string, [string, string[]][]][];

export class RedisQueueEngine implements IQueueEngine {
  constructor(
    private readonly redis: Redis,
    private readonly consumerName: string,
  ) {}

  async enqueue(event: QueuedEvent): Promise<void> {
    await this.redis.hset(
      `${DELIVERY_KEY_PREFIX}${event.id}`,
      'event_id',    event.eventId,
      'tenant_id',   event.tenantId,
      'topic_id',    event.topicId,
      'consumer_id', event.consumerId,
      'payload',     JSON.stringify(event.payload),
      'attempt',     String(event.attempt),
      'scheduled_at', event.scheduledAt.toISOString(),
    );
    await this.redis.xadd(STREAM_KEY, '*', 'delivery_id', event.id);
  }

  async claim(limit: number): Promise<QueuedEvent[]> {
    await this.promoteRetryQueue();
    await this.ensureGroup();

    const raw = await this.redis.xreadgroup(
      'GROUP', GROUP_NAME, this.consumerName,
      'COUNT', String(limit),
      'STREAMS', STREAM_KEY, '>',
    ) as StreamMessages | null;

    if (!raw) return [];

    const deliveries: QueuedEvent[] = [];

    for (const [, messages] of raw) {
      for (const [streamId, fields] of messages) {
        const deliveryId = this.extractField(fields, 'delivery_id');
        if (!deliveryId) continue;

        const data = await this.redis.hgetall(`${DELIVERY_KEY_PREFIX}${deliveryId}`);
        if (!data['event_id']) continue;

        await this.redis.hset(`${DELIVERY_KEY_PREFIX}${deliveryId}`, 'stream_id', streamId);

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
    const streamId = await this.redis.hget(`${DELIVERY_KEY_PREFIX}${deliveryId}`, 'stream_id');
    if (streamId) {
      await this.redis.xack(STREAM_KEY, GROUP_NAME, streamId);
    }
    await this.redis.del(`${DELIVERY_KEY_PREFIX}${deliveryId}`);
  }

  async markAwaitingAck(deliveryId: string): Promise<void> {
    await this.redis.hset(`${DELIVERY_KEY_PREFIX}${deliveryId}`, 'status', 'awaiting_ack');
  }

  async scheduleRetry(deliveryId: string, delaySeconds: number): Promise<void> {
    const streamId = await this.redis.hget(`${DELIVERY_KEY_PREFIX}${deliveryId}`, 'stream_id');
    if (streamId) {
      await this.redis.xack(STREAM_KEY, GROUP_NAME, streamId);
    }

    const currentAttempt = Number(
      await this.redis.hget(`${DELIVERY_KEY_PREFIX}${deliveryId}`, 'attempt') ?? '0',
    );
    const scheduledAt = Date.now() + delaySeconds * 1000;

    await this.redis.hset(
      `${DELIVERY_KEY_PREFIX}${deliveryId}`,
      'attempt',      String(currentAttempt + 1),
      'scheduled_at', new Date(scheduledAt).toISOString(),
    );

    await this.redis.zadd(RETRY_KEY, scheduledAt, deliveryId);
  }

  async moveToDeadLetter(deliveryId: string, reason: string): Promise<void> {
    const data = await this.redis.hgetall(`${DELIVERY_KEY_PREFIX}${deliveryId}`);

    if (data['stream_id']) {
      await this.redis.xack(STREAM_KEY, GROUP_NAME, data['stream_id']);
    }

    await this.redis.xadd(
      DLQ_KEY, '*',
      'delivery_id', deliveryId,
      'event_id',    data['event_id'] ?? '',
      'tenant_id',   data['tenant_id'] ?? '',
      'consumer_id', data['consumer_id'] ?? '',
      'reason',      reason,
      'payload',     data['payload'] ?? '{}',
      'failed_at',   new Date().toISOString(),
    );

    await this.redis.del(`${DELIVERY_KEY_PREFIX}${deliveryId}`);
  }

  private async ensureGroup(): Promise<void> {
    try {
      await this.redis.xgroup('CREATE', STREAM_KEY, GROUP_NAME, '0', 'MKSTREAM');
    } catch (error) {
      if (!(error instanceof Error) || !error.message.startsWith('BUSYGROUP')) {
        throw error;
      }
    }
  }

  private async promoteRetryQueue(): Promise<void> {
    const now = Date.now();
    const due = await this.redis.zrangebyscore(RETRY_KEY, 0, now);
    if (!due.length) return;

    for (const deliveryId of due) {
      await this.redis.xadd(STREAM_KEY, '*', 'delivery_id', deliveryId);
    }
    await this.redis.zrem(RETRY_KEY, ...due);
  }

  private extractField(fields: string[], name: string): string | undefined {
    const index = fields.indexOf(name);
    return index !== -1 ? fields[index + 1] : undefined;
  }
}
