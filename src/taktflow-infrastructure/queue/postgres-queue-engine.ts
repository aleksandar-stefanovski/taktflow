import type { IQueueEngine, QueuedEvent } from '../interfaces/queue-engine.interface.js';
import type { IDatabasePool } from '../interfaces/database-pool.interface.js';
import type { IPoolClient } from '../interfaces/pool-client.interface.js';
import type { DeliveryRow } from '../interfaces/delivery-row.interface.js';

export class PostgresQueueEngine implements IQueueEngine {
  constructor(private readonly pool: IDatabasePool) {}

  async enqueue(event: QueuedEvent): Promise<void> {
    await this.pool.query(
      `INSERT INTO event_deliveries (id, tenant_id, event_id, consumer_id, status, retry_count, scheduled_at)
       VALUES ($1, $2, $3, $4, 'pending', $5, $6)`,
      [event.id, event.tenantId, event.eventId, event.consumerId, event.attempt, event.scheduledAt],
    );
  }

  async claim(limit: number): Promise<QueuedEvent[]> {
    const client: IPoolClient = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const claimed = await client.query<DeliveryRow>(
        `SELECT ed.id, ed.event_id, ed.tenant_id, ed.consumer_id, ed.retry_count, ed.scheduled_at,
                e.payload, e.topic_id
         FROM event_deliveries ed
         JOIN events e ON e.id = ed.event_id
         WHERE ed.status = 'pending' AND ed.scheduled_at <= NOW()
         ORDER BY ed.scheduled_at ASC
         FOR UPDATE OF ed SKIP LOCKED
         LIMIT $1`,
        [limit],
      );

      if (claimed.rows.length === 0) {
        await client.query('COMMIT');
        return [];
      }

      const ids = claimed.rows.map(row => row.id);

      await client.query(
        `UPDATE event_deliveries
         SET status = 'processing', started_at = NOW(), updated_at = NOW()
         WHERE id = ANY($1)`,
        [ids],
      );

      await client.query('COMMIT');

      return claimed.rows.map(row => ({
        id:          row.id,
        eventId:     row.event_id,
        tenantId:    row.tenant_id,
        topicId:     row.topic_id,
        consumerId:  row.consumer_id,
        payload:     row.payload,
        attempt:     row.retry_count,
        scheduledAt: row.scheduled_at,
      }));
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async claimForConsumer(consumerId: string, tenantId: string, limit: number): Promise<QueuedEvent[]> {
    const client: IPoolClient = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // NOTE: raw SQL required — Drizzle does not support FOR UPDATE SKIP LOCKED
      const claimed = await client.query<DeliveryRow>(
        `SELECT ed.id, ed.event_id, ed.tenant_id, ed.consumer_id, ed.retry_count, ed.scheduled_at,
                e.payload, e.topic_id
         FROM event_deliveries ed
         JOIN events e ON e.id = ed.event_id
         WHERE ed.status = 'pending' AND ed.scheduled_at <= NOW()
           AND ed.consumer_id = $1 AND ed.tenant_id = $2
         ORDER BY ed.scheduled_at ASC
         FOR UPDATE OF ed SKIP LOCKED
         LIMIT $3`,
        [consumerId, tenantId, limit],
      );

      if (claimed.rows.length === 0) {
        await client.query('COMMIT');
        return [];
      }

      const ids = claimed.rows.map(row => row.id);

      await client.query(
        `UPDATE event_deliveries
         SET status = 'processing', started_at = NOW(), updated_at = NOW()
         WHERE id = ANY($1)`,
        [ids],
      );

      await client.query('COMMIT');

      return claimed.rows.map(row => ({
        id:          row.id,
        eventId:     row.event_id,
        tenantId:    row.tenant_id,
        topicId:     row.topic_id,
        consumerId:  row.consumer_id,
        payload:     row.payload,
        attempt:     row.retry_count,
        scheduledAt: row.scheduled_at,
      }));
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async acknowledge(deliveryId: string): Promise<void> {
    await this.pool.query(
      `UPDATE event_deliveries
       SET status = 'delivered', delivered_at = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [deliveryId],
    );
  }

  async markAwaitingAck(deliveryId: string): Promise<void> {
    await this.pool.query(
      `UPDATE event_deliveries SET status = 'awaiting_ack', updated_at = NOW()
       WHERE id = $1`,
      [deliveryId],
    );
  }

  async releaseToPending(deliveryId: string): Promise<void> {
    await this.pool.query(
      `UPDATE event_deliveries
       SET status = 'pending', started_at = NULL, updated_at = NOW()
       WHERE id = $1`,
      [deliveryId],
    );
  }

  async scheduleRetry(deliveryId: string, delaySeconds: number): Promise<void> {
    await this.pool.query(
      `UPDATE event_deliveries
       SET status = 'pending',
           scheduled_at = NOW() + ($2 * INTERVAL '1 second'),
           retry_count = retry_count + 1,
           updated_at = NOW()
       WHERE id = $1`,
      [deliveryId, delaySeconds],
    );
  }

  async moveToDeadLetter(deliveryId: string, reason: string): Promise<void> {
    const client: IPoolClient = await this.pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `WITH delivery_data AS (
           SELECT ed.tenant_id, ed.id AS delivery_id, ed.event_id, ed.consumer_id, e.payload
           FROM event_deliveries ed
           JOIN events e ON e.id = ed.event_id
           WHERE ed.id = $1
         )
         INSERT INTO dead_letter_events
           (tenant_id, event_delivery_id, event_id, consumer_id, failure_reason, payload_snapshot)
         SELECT tenant_id, delivery_id, event_id, consumer_id, $2, payload
         FROM delivery_data`,
        [deliveryId, reason],
      );

      await client.query(
        `UPDATE event_deliveries SET status = 'failed', updated_at = NOW()
         WHERE id = $1`,
        [deliveryId],
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
