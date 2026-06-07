import { pgTable, uuid, integer, bigint, timestamp } from 'drizzle-orm/pg-core';

import { tenants } from './tenants.js';

export const projectMetrics = pgTable('project_metrics', {
  tenantId:          uuid('tenant_id').primaryKey().references(() => tenants.id, { onDelete: 'cascade' }),
  eventsToday:       integer('events_today').notNull().default(0),
  eventsTotal:       integer('events_total').notNull().default(0),
  successCount:      integer('success_count').notNull().default(0),
  failureCount:      integer('failure_count').notNull().default(0),
  totalProcessingMs: bigint('total_processing_ms', { mode: 'number' }).notNull().default(0),
  updatedAt:         timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type ProjectMetricsRow = typeof projectMetrics.$inferSelect;
export type NewProjectMetricsRow = typeof projectMetrics.$inferInsert;
