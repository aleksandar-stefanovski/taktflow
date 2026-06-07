import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const tenants = pgTable('tenants', {
  id:        uuid('id').primaryKey().defaultRandom(),
  name:      varchar('name', { length: 255 }).notNull(),
  plan:      varchar('plan', { length: 50 }).notNull().default('starter'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export type TenantRow = typeof tenants.$inferSelect;
export type NewTenantRow = typeof tenants.$inferInsert;
