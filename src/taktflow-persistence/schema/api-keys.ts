import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

import { tenants } from './tenants.js';

export const apiKeys = pgTable('api_keys', {
  id:          uuid('id').primaryKey().defaultRandom(),
  tenantId:    uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name:        varchar('name', { length: 255 }).notNull(),
  keyHash:     varchar('key_hash', { length: 64 }).notNull(),
  keyPrefix:   varchar('key_prefix', { length: 16 }).notNull(),
  environment: varchar('environment', { length: 50 }).notNull(),
  lastUsed:    timestamp('last_used', { withTimezone: true }),
  createdAt:   timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt:   timestamp('deleted_at', { withTimezone: true }),
});

export type ApiKeyRow = typeof apiKeys.$inferSelect;
export type NewApiKeyRow = typeof apiKeys.$inferInsert;
