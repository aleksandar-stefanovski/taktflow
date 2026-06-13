import type { Pool } from 'pg';
import pino from 'pino';

import type { DrizzleDb } from '@persistence/database.js';
import { PostgresQueueEngine }             from '@persistence/queue/postgres-queue-engine.js';
import { EventRepository }                 from '@persistence/repositories/event-repository.js';
import { ConsumerRepository }              from '@persistence/repositories/consumer-repository.js';
import { TopicRepository }                 from '@persistence/repositories/topic-repository.js';
import { ScheduleRepository }              from '@persistence/repositories/schedule-repository.js';
import { TenantMetricsRepository }         from '@persistence/repositories/tenant-metrics-repository.js';
import { EventDeliveryRepository }         from '@persistence/repositories/event-delivery-repository.js';
import { AsyncLocalStorageTenantProvider } from '@infrastructure/context/async-local-storage-tenant-provider.js';

import { workerConfig }        from '../config/worker.config.js';
import { createLoggerMessages } from './logger-message.extension.js';

import { MetricsService }   from '../services/metrics-service.js';
import { RetryService }     from '../services/retry-service.js';
import { DeliveryService }  from '../services/delivery-service.js';
import { SchedulerService } from '../services/scheduler-service.js';
import { CleanupService }   from '../services/cleanup-service.js';

export function buildWorkerServices(db: DrizzleDb) {
  const pool           = (db as unknown as { $client: Pool }).$client;
  const tenantProvider = new AsyncLocalStorageTenantProvider();
  const logger         = createLoggerMessages(pino({ level: workerConfig.LOG_LEVEL }));
  const config         = workerConfig;
  const queue          = new PostgresQueueEngine(db);

  const events     = new EventRepository(db, tenantProvider);
  const consumers  = new ConsumerRepository(db, tenantProvider);
  const topics     = new TopicRepository(db, tenantProvider);
  const schedules  = new ScheduleRepository(db, tenantProvider);
  const metrics    = new TenantMetricsRepository(db);
  const deliveries = new EventDeliveryRepository(db, tenantProvider);

  const metricsService   = new MetricsService(metrics, logger, config);
  const retryService     = new RetryService(deliveries, queue, logger, config, metricsService);
  const deliveryService  = new DeliveryService(queue, events, consumers, topics, logger, config, retryService, metricsService);
  const schedulerService = new SchedulerService(schedules, events, consumers, queue, logger, config);
  const cleanupService   = new CleanupService(pool, logger, config);

  return { deliveryService, retryService, schedulerService, cleanupService, metricsService };
}
