import type { IEventRepository } from '@domain/interfaces/event-repository.interface.js';
import type { IConsumerRepository } from '@domain/interfaces/consumer-repository.interface.js';
import type { ITopicRepository } from '@domain/interfaces/topic-repository.interface.js';
import type { IScheduleRepository } from '@domain/interfaces/schedule-repository.interface.js';
import type { ITenantMetricsRepository } from '@domain/interfaces/tenant-metrics-repository.interface.js';
import type { IDeadLetterEventRepository } from '@domain/interfaces/dead-letter-event-repository.interface.js';
import type { IEventDeliveryRepository } from '@domain/interfaces/event-delivery-repository.interface.js';
import type { IQueueEngine } from '@infrastructure/interfaces/queue-engine.interface.js';
import type { IEmailClient } from '@infrastructure/interfaces/email-client.interface.js';
import type { IDatabasePool } from './database-pool.interface.js';
import type { IWorkerLogger } from './worker-logger.interface.js';
import type { WorkerConfig } from './worker-config.interface.js';

export interface WorkerDependencies {
  pool: IDatabasePool;
  events: IEventRepository;
  consumers: IConsumerRepository;
  topics: ITopicRepository;
  schedules: IScheduleRepository;
  metrics: ITenantMetricsRepository;
  dlq: IDeadLetterEventRepository;
  deliveries: IEventDeliveryRepository;
  queue: IQueueEngine;
  email: IEmailClient;
  logger: IWorkerLogger;
  config: WorkerConfig;
}
