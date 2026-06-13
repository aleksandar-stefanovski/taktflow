import { randomUUID } from 'node:crypto';

import { eq, sql } from 'drizzle-orm';

import type { ClaimedEvent }  from '@taktflow/domain/types/claimed-event.type.js';
import type { DrizzleDb }     from '@persistence/database.js';
import { eventDeliveries }    from '@persistence/schema/event-deliveries.js';
import { deadLetterEvents }   from '@persistence/schema/dead-letter-events.js';
import { events }             from '@persistence/schema/events.js';
import type { IEventQueueService }  from '@taktflow/domain/interfaces/event-queue-service.interface.js';

type DrizzleTx = Parameters<Parameters<DrizzleDb['transaction']>[0]>[0];

type DeliveryRow = {
  id:           string;
  event_id:     string;
  tenant_id:    string;
  topic_id:     string;
  consumer_id:  string;
  payload:      Record<string, unknown>;
  retry_count:  number;
  scheduled_at: Date;
};

export class PostgresQueueEngine implements IEventQueueService {
  constructor(private readonly db: DrizzleDb) {}

  async enqueue(event: ClaimedEvent): Promise<void> {
    await this.db
      .insert(eventDeliveries)
      .values({
        id:          event.id,
        tenantId:    event.tenantId,
        eventId:     event.eventId,
        consumerId:  event.consumerId,
        status:      'pending',
        retryCount:  event.attempt,
        scheduledAt: event.scheduledAt,
      });
  }

  async claim(limit: number): Promise<ClaimedEvent[]> {
    return this.db.transaction(async (tx: DrizzleTx) => {
      // NOTE: raw SQL required — Drizzle does not support FOR UPDATE SKIP LOCKED
      const result = await tx.execute(sql`
        SELECT ed.id, ed.event_id, ed.tenant_id, ed.consumer_id, ed.retry_count, ed.scheduled_at,
               e.payload, e.topic_id
        FROM event_deliveries ed
        JOIN events e ON e.id = ed.event_id
        WHERE ed.status = 'pending' AND ed.scheduled_at <= NOW()
        ORDER BY ed.scheduled_at ASC
        FOR UPDATE OF ed SKIP LOCKED
        LIMIT ${limit}
      `);

      const rows = result.rows as unknown as DeliveryRow[];
      if (rows.length === 0) return [];

      const ids = sql.join(rows.map((row: DeliveryRow) => sql`${row.id}`), sql`, `);
      await tx.execute(sql`
        UPDATE event_deliveries
        SET status = 'processing', started_at = NOW(), updated_at = NOW()
        WHERE id IN (${ids})
      `);

      const eventIds = sql.join(
        [...new Set(rows.map((row: DeliveryRow) => row.event_id))].map(id => sql`${id}`),
        sql`, `,
      );
      await tx.execute(sql`
        UPDATE events
        SET status = 'processing', started_at = COALESCE(started_at, NOW()), updated_at = NOW()
        WHERE id IN (${eventIds}) AND status = 'pending'
      `);

      return rows.map(this.toClaimedEvent);
    });
  }

  async claimForConsumer(consumerId: string, tenantId: string, limit: number): Promise<ClaimedEvent[]> {
    return this.db.transaction(async (tx: DrizzleTx) => {
      // NOTE: raw SQL required — Drizzle does not support FOR UPDATE SKIP LOCKED
      const result = await tx.execute(sql`
        SELECT ed.id, ed.event_id, ed.tenant_id, ed.consumer_id, ed.retry_count, ed.scheduled_at,
               e.payload, e.topic_id
        FROM event_deliveries ed
        JOIN events e ON e.id = ed.event_id
        WHERE ed.status = 'pending' AND ed.scheduled_at <= NOW()
          AND ed.consumer_id = ${consumerId} AND ed.tenant_id = ${tenantId}
        ORDER BY ed.scheduled_at ASC
        FOR UPDATE OF ed SKIP LOCKED
        LIMIT ${limit}
      `);

      const rows = result.rows as unknown as DeliveryRow[];
      if (rows.length === 0) return [];

      const ids = sql.join(rows.map((row: DeliveryRow) => sql`${row.id}`), sql`, `);
      await tx.execute(sql`
        UPDATE event_deliveries
        SET status = 'processing', started_at = NOW(), updated_at = NOW()
        WHERE id IN (${ids})
      `);

      const eventIds = sql.join(
        [...new Set(rows.map((row: DeliveryRow) => row.event_id))].map(id => sql`${id}`),
        sql`, `,
      );
      await tx.execute(sql`
        UPDATE events
        SET status = 'processing', started_at = COALESCE(started_at, NOW()), updated_at = NOW()
        WHERE id IN (${eventIds}) AND status = 'pending'
      `);

      return rows.map(this.toClaimedEvent);
    });
  }

  async acknowledge(deliveryId: string, responseStatus?: number, responseBody?: string): Promise<void> {
    const [row] = await this.db
      .update(eventDeliveries)
      .set({
        status:         'delivered',
        deliveredAt:    new Date(),
        updatedAt:      new Date(),
        responseStatus: responseStatus ?? null,
        responseBody:   responseBody   ?? null,
      })
      .where(eq(eventDeliveries.id, deliveryId))
      .returning({ eventId: eventDeliveries.eventId });
    if (row) await this.syncEventStatus(this.db, row.eventId);
  }

  async markAwaitingAck(deliveryId: string): Promise<void> {
    await this.db
      .update(eventDeliveries)
      .set({ status: 'awaiting_ack', updatedAt: new Date() })
      .where(eq(eventDeliveries.id, deliveryId));
  }

  async releaseToPending(deliveryId: string): Promise<void> {
    await this.db
      .update(eventDeliveries)
      .set({ status: 'pending', startedAt: null, updatedAt: new Date() })
      .where(eq(eventDeliveries.id, deliveryId));
  }

  async scheduleRetry(deliveryId: string, delayMs: number): Promise<void> {
    await this.db
      .update(eventDeliveries)
      .set({
        status:      'pending',
        scheduledAt: sql`NOW() + (${delayMs} * INTERVAL '1 millisecond')`,
        retryCount:  sql`${eventDeliveries.retryCount} + 1`,
        updatedAt:   new Date(),
      })
      .where(eq(eventDeliveries.id, deliveryId));
  }

  async moveToDeadLetter(deliveryId: string, reason: string, responseStatus?: number, responseBody?: string): Promise<void> {
    await this.db.transaction(async (tx: DrizzleTx) => {
      const [delivery] = await tx
        .select({
          tenantId:   eventDeliveries.tenantId,
          eventId:    eventDeliveries.eventId,
          consumerId: eventDeliveries.consumerId,
          payload:    events.payload,
        })
        .from(eventDeliveries)
        .innerJoin(events, eq(events.id, eventDeliveries.eventId))
        .where(eq(eventDeliveries.id, deliveryId))
        .limit(1);

      if (!delivery) return;

      await tx.insert(deadLetterEvents).values({
        id:              randomUUID(),
        tenantId:        delivery.tenantId,
        eventDeliveryId: deliveryId,
        eventId:         delivery.eventId,
        consumerId:      delivery.consumerId,
        failureReason:   reason,
        payloadSnapshot: delivery.payload as Record<string, unknown>,
        replayed:        false,
        replayedAt:      null,
        createdAt:       new Date(),
        updatedAt:       new Date(),
      });

      await tx
        .update(eventDeliveries)
        .set({
          status:         'failed',
          updatedAt:      new Date(),
          responseStatus: responseStatus ?? null,
          responseBody:   responseBody   ?? null,
          errorMessage:   reason,
        })
        .where(eq(eventDeliveries.id, deliveryId));

      await this.syncEventStatus(tx, delivery.eventId);
    });
  }

  private async syncEventStatus(executor: DrizzleDb | DrizzleTx, eventId: string): Promise<void> {
    await executor.execute(sql`
      UPDATE events e
      SET status = agg.new_status,
          processed_at = CASE WHEN agg.new_status IN ('delivered', 'failed') THEN NOW() ELSE e.processed_at END,
          updated_at = NOW()
      FROM (
        SELECT
          CASE
            WHEN count(*) FILTER (WHERE status IN ('pending', 'processing', 'awaiting_ack')) > 0 THEN 'processing'
            WHEN count(*) FILTER (WHERE status = 'failed') > 0 THEN 'failed'
            ELSE 'delivered'
          END AS new_status
        FROM event_deliveries
        WHERE event_id = ${eventId}
      ) agg
      WHERE e.id = ${eventId}
    `);
  }

  private toClaimedEvent(row: DeliveryRow): ClaimedEvent {
    return {
      id:          row.id,
      eventId:     row.event_id,
      tenantId:    row.tenant_id,
      topicId:     row.topic_id,
      consumerId:  row.consumer_id,
      payload:     row.payload,
      attempt:     row.retry_count,
      scheduledAt: row.scheduled_at,
    };
  }
}
