import { pgTable, uuid, varchar, jsonb, timestamp, unique } from 'drizzle-orm/pg-core';

import { tenants } from './tenants.js';

export const topics = pgTable('topics', {
  id:        uuid('id').primaryKey().defaultRandom(),
  tenantId:  uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name:      varchar('name', { length: 255 }).notNull(),
  config:    jsonb('config').notNull().default({
    retentionDays: 7,
    maxPayloadKb: 256,
    ordering: 'unordered',
  }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => [
  unique().on(table.tenantId, table.name),
]);

export type TopicRow = typeof topics.$inferSelect;
export type NewTopicRow = typeof topics.$inferInsert;
