import { pgTable, uuid, varchar, jsonb, timestamp } from 'drizzle-orm/pg-core';

import { tenants } from './tenants.js';
import { topics } from './topics.js';

export const schedules = pgTable('schedules', {
  id:          uuid('id').primaryKey().defaultRandom(),
  tenantId:    uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  topicId:     uuid('topic_id').notNull().references(() => topics.id, { onDelete: 'cascade' }),
  cron:        varchar('cron', { length: 100 }).notNull(),
  payload:     jsonb('payload').notNull().default({}),
  environment: varchar('environment', { length: 50 }).notNull(),
  status:      varchar('status', { length: 20 }).notNull().default('active'),
  lastRun:     timestamp('last_run', { withTimezone: true }),
  nextRun:     timestamp('next_run', { withTimezone: true }),
  createdAt:   timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt:   timestamp('deleted_at', { withTimezone: true }),
});

export type ScheduleRow = typeof schedules.$inferSelect;
export type NewScheduleRow = typeof schedules.$inferInsert;
