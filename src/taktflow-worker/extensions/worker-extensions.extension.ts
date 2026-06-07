import type { Pool } from 'pg';
import pino from 'pino';

import type { DrizzleDb } from '@persistence/database.js';
import type { WorkerConfig } from '../interfaces/worker-config.interface.js';
import { EventRepository } from '@persistence/repositories/event-repository.js';
import { ConsumerRepository } from '@persistence/repositories/consumer-repository.js';
import { TopicRepository } from '@persistence/repositories/topic-repository.js';
import { ScheduleRepository } from '@persistence/repositories/schedule-repository.js';
import { TenantMetricsRepository } from '@persistence/repositories/tenant-metrics-repository.js';
import { DeadLetterEventRepository } from '@persistence/repositories/dead-letter-event-repository.js';
import { EventDeliveryRepository } from '@persistence/repositories/event-delivery-repository.js';

import { PostgresQueueEngine } from '@infrastructure/queue/postgres-queue-engine.js';
import { ResendEmailClient } from '@infrastructure/email/resend-email-client.js';

import { createLoggerExtensions } from './logger-extensions.extension.js';
import { WorkerEngine } from '../engine/worker-engine.js';
import { env } from '../config/env.js';

export function buildWorkerEngine(db: DrizzleDb, config: WorkerConfig): WorkerEngine {
  const pool = (db as unknown as { $client: Pool }).$client;

  const events     = new EventRepository(db);
  const consumers  = new ConsumerRepository(db);
  const topics     = new TopicRepository(db);
  const schedules  = new ScheduleRepository(db);
  const metrics    = new TenantMetricsRepository(db);
  const dlq        = new DeadLetterEventRepository(db);
  const deliveries = new EventDeliveryRepository(db);

  const queue = new PostgresQueueEngine(pool);
  const email = new ResendEmailClient(env.RESEND_API_KEY, env.ALERT_FROM_EMAIL);

  const logger = createLoggerExtensions(
    pino({ level: process.env['LOG_LEVEL'] ?? 'info' }),
  );

  return new WorkerEngine({
    pool,
    events,
    consumers,
    topics,
    schedules,
    metrics,
    dlq,
    deliveries,
    queue,
    email,
    logger,
    config,
  });
}
