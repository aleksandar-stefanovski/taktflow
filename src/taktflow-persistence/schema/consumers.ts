import { pgTable, uuid, varchar, text, jsonb, timestamp } from 'drizzle-orm/pg-core';

import { tenants } from './tenants.js';
import { topics } from './topics.js';

export const consumers = pgTable('consumers', {
  id:          uuid('id').primaryKey().defaultRandom(),
  tenantId:    uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  topicId:     uuid('topic_id').notNull().references(() => topics.id, { onDelete: 'cascade' }),
  name:        varchar('name', { length: 255 }).notNull(),
  type:        varchar('type', { length: 20 }).notNull().default('push'),
  url:         text('url'),
  secret:      varchar('secret', { length: 255 }).notNull(),
  environment: varchar('environment', { length: 50 }).notNull().default('production'),
  status:      varchar('status', { length: 20 }).notNull().default('active'),
  config:      jsonb('config').notNull().default({
    timeoutSeconds: 30,
    retryAttempts: 3,
    retryBackoff: 'exponential',
    retryInitialDelay: 30,
    alertAfterFailures: 3,
    alertEmail: null,
    maxConcurrent: 10,
  }),
  createdAt:   timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt:   timestamp('deleted_at', { withTimezone: true }),
});

export type ConsumerRow = typeof consumers.$inferSelect;
export type NewConsumerRow = typeof consumers.$inferInsert;
