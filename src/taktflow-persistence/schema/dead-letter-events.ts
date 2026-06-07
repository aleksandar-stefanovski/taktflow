import { pgTable, uuid, text, jsonb, boolean, timestamp } from 'drizzle-orm/pg-core';

import { tenants } from './tenants.js';
import { events } from './events.js';
import { consumers } from './consumers.js';
import { eventDeliveries } from './event-deliveries.js';

export const deadLetterEvents = pgTable('dead_letter_events', {
  id:              uuid('id').primaryKey().defaultRandom(),
  tenantId:        uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  eventDeliveryId: uuid('event_delivery_id').notNull().references(() => eventDeliveries.id, { onDelete: 'cascade' }),
  eventId:         uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  consumerId:      uuid('consumer_id').notNull().references(() => consumers.id, { onDelete: 'cascade' }),
  failureReason:   text('failure_reason').notNull(),
  payloadSnapshot: jsonb('payload_snapshot').notNull(),
  replayed:        boolean('replayed').notNull().default(false),
  replayedAt:      timestamp('replayed_at', { withTimezone: true }),
  createdAt:       timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:       timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type DeadLetterEventRow = typeof deadLetterEvents.$inferSelect;
export type NewDeadLetterEventRow = typeof deadLetterEvents.$inferInsert;
