import { pgTable, uuid, varchar, jsonb, timestamp } from 'drizzle-orm/pg-core';

import { tenants } from './tenants.js';
import { topics } from './topics.js';

export const events = pgTable('events', {
  id:             uuid('id').primaryKey().defaultRandom(),
  tenantId:       uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  topicId:        uuid('topic_id').notNull().references(() => topics.id, { onDelete: 'cascade' }),
  payload:        jsonb('payload').notNull(),
  status:         varchar('status', { length: 20 }).notNull().default('pending'),
  source:         varchar('source', { length: 20 }).notNull().default('api'),
  idempotencyKey: varchar('idempotency_key', { length: 255 }),
  checksum:       varchar('checksum', { length: 64 }).notNull(),
  scheduledAt:    timestamp('scheduled_at', { withTimezone: true }).notNull().defaultNow(),
  startedAt:      timestamp('started_at', { withTimezone: true }),
  processedAt:    timestamp('processed_at', { withTimezone: true }),
  createdAt:      timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:      timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type EventRow = typeof events.$inferSelect;
export type NewEventRow = typeof events.$inferInsert;
