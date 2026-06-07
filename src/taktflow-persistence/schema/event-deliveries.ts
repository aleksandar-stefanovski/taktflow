import { pgTable, uuid, varchar, integer, text, timestamp } from 'drizzle-orm/pg-core';

import { tenants } from './tenants.js';
import { events } from './events.js';
import { consumers } from './consumers.js';

export const eventDeliveries = pgTable('event_deliveries', {
  id:             uuid('id').primaryKey().defaultRandom(),
  tenantId:       uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  eventId:        uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  consumerId:     uuid('consumer_id').notNull().references(() => consumers.id, { onDelete: 'cascade' }),
  status:         varchar('status', { length: 20 }).notNull().default('pending'),
  retryCount:     integer('retry_count').notNull().default(0),
  scheduledAt:    timestamp('scheduled_at', { withTimezone: true }).notNull().defaultNow(),
  startedAt:      timestamp('started_at', { withTimezone: true }),
  deliveredAt:    timestamp('delivered_at', { withTimezone: true }),
  responseStatus: integer('response_status'),
  responseBody:   text('response_body'),
  errorMessage:   text('error_message'),
  createdAt:      timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:      timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type EventDeliveryRow = typeof eventDeliveries.$inferSelect;
export type NewEventDeliveryRow = typeof eventDeliveries.$inferInsert;
