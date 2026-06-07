import type { Pool } from 'pg';
import pino from 'pino';

import type { DrizzleDb } from '@persistence/database.js';
import { EventRepository } from '@persistence/repositories/event-repository.js';
import { ConsumerRepository } from '@persistence/repositories/consumer-repository.js';
import { TopicRepository } from '@persistence/repositories/topic-repository.js';
import { ScheduleRepository } from '@persistence/repositories/schedule-repository.js';
import { TenantMetricsRepository } from '@persistence/repositories/tenant-metrics-repository.js';
import { DeadLetterEventRepository } from '@persistence/repositories/dead-letter-event-repository.js';
import { EventDeliveryRepository } from '@persistence/repositories/event-delivery-repository.js';

import { PostgresQueueEngine } from '@infrastructure/queue/postgres-queue-engine.js';
import { ResendEmailClient } from '@infrastructure/email/resend-email-client.js';


import { createLoggerMessages } from './logger-message.extension.js';
import { WorkerEngine } from '../engine/worker-engine.js';
import type { WorkerEnv } from '../config/env.js';

export function buildWorkerEngine(db: DrizzleDb, env: WorkerEnv): WorkerEngine {
  const pool = (db as unknown as { $client: Pool }).$client;

  const events     = new EventRepository(db);
  const consumers  = new ConsumerRepository(db);
  const topics     = new TopicRepository(db);
  const schedules  = new ScheduleRepository(db);
  const metrics    = new TenantMetricsRepository(db);
  const dlq        = new DeadLetterEventRepository(db);
  const deliveries = new EventDeliveryRepository(db);

  const queue  = new PostgresQueueEngine(pool);
  const email  = new ResendEmailClient(env.RESEND_API_KEY, env.ALERT_FROM_EMAIL);
  const logger = createLoggerMessages(pino({ level: env.LOG_LEVEL }));

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
    config: {
      batchSize:                env.WORKER_BATCH_SIZE,
      pollIntervalMs:           env.WORKER_POLL_INTERVAL_MS,
      deliveryTimeoutMs:        env.WORKER_DELIVERY_TIMEOUT_MS,
      stuckThresholdMs:         env.WORKER_STUCK_THRESHOLD_MS,
      unstuckIntervalMs:        env.WORKER_UNSTUCK_INTERVAL_MS,
      retryIntervalMs:          env.WORKER_RETRY_INTERVAL_MS,
      schedulerIntervalMs:      env.WORKER_SCHEDULER_INTERVAL_MS,
      alertIntervalMs:          env.WORKER_ALERT_INTERVAL_MS,
      cleanupIntervalMs:        env.WORKER_CLEANUP_INTERVAL_MS,
      metricsFlushIntervalMs:   env.WORKER_METRICS_FLUSH_INTERVAL_MS,
      shutdownPollIntervalMs:   env.WORKER_SHUTDOWN_POLL_INTERVAL_MS,
      defaultRetryAttempts:     env.WORKER_DEFAULT_RETRY_ATTEMPTS,
      schedulerBatchSize:       env.WORKER_SCHEDULER_BATCH_SIZE,
      schedulerConsumerLimit:   env.WORKER_SCHEDULER_CONSUMER_LIMIT,
      awaitingAckTimeoutHours:  env.WORKER_AWAITING_ACK_TIMEOUT_HOURS,
      memoryWarningThresholdMb: env.WORKER_MEMORY_WARNING_THRESHOLD_MB,
      maxRetentionDays:         env.WORKER_MAX_RETENTION_DAYS,
      shutdownMaxWaitMs:        env.WORKER_SHUTDOWN_MAX_WAIT_MS,
      retryBaseDelayMs:         env.RETRY_BASE_DELAY_MS,
      maxResponseBodyBytes:     env.WORKER_MAX_RESPONSE_BODY_BYTES,
    },
  });
}
