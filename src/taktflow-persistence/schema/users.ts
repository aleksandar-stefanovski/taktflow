import { pgTable, uuid, varchar, timestamp, unique } from 'drizzle-orm/pg-core';

import { tenants } from './tenants.js';

export const users = pgTable('users', {
  id:                 uuid('id').primaryKey().defaultRandom(),
  tenantId:           uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
  email:              varchar('email', { length: 255 }).notNull(),
  passwordHash:       varchar('password_hash', { length: 255 }).notNull(),
  firstName:          varchar('first_name', { length: 100 }).notNull(),
  lastName:           varchar('last_name', { length: 100 }).notNull(),
  role:               varchar('role', { length: 20 }).notNull().default('owner'),
  refreshToken:       varchar('refresh_token', { length: 255 }),
  refreshTokenExpiry: timestamp('refresh_token_expiry', { withTimezone: true }),
  lastLogin:          timestamp('last_login', { withTimezone: true }),
  createdAt:          timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:          timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt:          timestamp('deleted_at', { withTimezone: true }),
}, (table) => [
  unique().on(table.email),
]);

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
