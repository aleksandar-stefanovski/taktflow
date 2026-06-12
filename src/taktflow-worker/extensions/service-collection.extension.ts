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
import { AsyncLocalStorageTenantProvider } from '@infrastructure/context/async-local-storage-tenant-provider.js';

import { engineConfig } from '../config/engine.config.js';
import { emailConfig }  from '../config/email.config.js';
import { serverConfig } from '../config/server.config.js';

import { createLoggerMessages } from './logger-message.extension.js';
import { WorkerEngine } from '../engine/worker-engine.js';

export function buildWorkerEngine(db: DrizzleDb): WorkerEngine {
  const pool           = (db as unknown as { $client: Pool }).$client;
  const tenantProvider = new AsyncLocalStorageTenantProvider();

  const events     = new EventRepository(db, tenantProvider);
  const consumers  = new ConsumerRepository(db, tenantProvider);
  const topics     = new TopicRepository(db, tenantProvider);
  const schedules  = new ScheduleRepository(db, tenantProvider);
  const metrics    = new TenantMetricsRepository(db);
  const dlq        = new DeadLetterEventRepository(db, tenantProvider);
  const deliveries = new EventDeliveryRepository(db, tenantProvider);

  const queue  = new PostgresQueueEngine(db);
  const email  = new ResendEmailClient(emailConfig.RESEND_API_KEY, emailConfig.ALERT_FROM_EMAIL);
  const logger = createLoggerMessages(pino({ level: serverConfig.LOG_LEVEL }));

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
      batchSize:                engineConfig.WORKER_BATCH_SIZE,
      pollIntervalMs:           engineConfig.WORKER_POLL_INTERVAL_MS,
      deliveryTimeoutMs:        engineConfig.WORKER_DELIVERY_TIMEOUT_MS,
      stuckThresholdMs:         engineConfig.WORKER_STUCK_THRESHOLD_MS,
      unstuckIntervalMs:        engineConfig.WORKER_UNSTUCK_INTERVAL_MS,
      retryIntervalMs:          engineConfig.WORKER_RETRY_INTERVAL_MS,
      schedulerIntervalMs:      engineConfig.WORKER_SCHEDULER_INTERVAL_MS,
      alertIntervalMs:          engineConfig.WORKER_ALERT_INTERVAL_MS,
      cleanupIntervalMs:        engineConfig.WORKER_CLEANUP_INTERVAL_MS,
      metricsFlushIntervalMs:   engineConfig.WORKER_METRICS_FLUSH_INTERVAL_MS,
      shutdownPollIntervalMs:   engineConfig.WORKER_SHUTDOWN_POLL_INTERVAL_MS,
      defaultRetryAttempts:     engineConfig.WORKER_DEFAULT_RETRY_ATTEMPTS,
      schedulerBatchSize:       engineConfig.WORKER_SCHEDULER_BATCH_SIZE,
      schedulerConsumerLimit:   engineConfig.WORKER_SCHEDULER_CONSUMER_LIMIT,
      awaitingAckTimeoutHours:  engineConfig.WORKER_AWAITING_ACK_TIMEOUT_HOURS,
      memoryWarningThresholdMb: engineConfig.WORKER_MEMORY_WARNING_THRESHOLD_MB,
      maxRetentionDays:         engineConfig.WORKER_MAX_RETENTION_DAYS,
      shutdownMaxWaitMs:        engineConfig.WORKER_SHUTDOWN_MAX_WAIT_MS,
      retryBaseDelayMs:         engineConfig.RETRY_BASE_DELAY_MS,
      maxResponseBodyBytes:     engineConfig.WORKER_MAX_RESPONSE_BODY_BYTES,
    },
  });
}
