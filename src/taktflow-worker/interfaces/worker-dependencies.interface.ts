import type { IWorkerEventStore }      from '@abstractions/interfaces/worker-event-store.interface.js';
import type { IWorkerConsumerStore }   from '@abstractions/interfaces/worker-consumer-store.interface.js';
import type { IWorkerTopicStore }      from '@abstractions/interfaces/worker-topic-store.interface.js';
import type { IWorkerScheduleStore }   from '@abstractions/interfaces/worker-schedule-store.interface.js';
import type { IWorkerMetricsStore }    from '@abstractions/interfaces/worker-metrics-store.interface.js';
import type { IWorkerDeadLetterStore } from '@abstractions/interfaces/worker-dead-letter-store.interface.js';
import type { IWorkerDeliveryStore }   from '@abstractions/interfaces/worker-delivery-store.interface.js';
import type { IQueueEngine }           from '@infrastructure/interfaces/queue-engine.interface.js';
import type { IEmailClient }           from '@infrastructure/interfaces/email-client.interface.js';
import type { IDatabasePool }          from './database-pool.interface.js';
import type { IWorkerLogger }          from './worker-logger.interface.js';
import type { WorkerConfig }           from './worker-config.interface.js';

export interface WorkerDependencies {
  pool:       IDatabasePool;
  events:     IWorkerEventStore;
  consumers:  IWorkerConsumerStore;
  topics:     IWorkerTopicStore;
  schedules:  IWorkerScheduleStore;
  metrics:    IWorkerMetricsStore;
  dlq:        IWorkerDeadLetterStore;
  deliveries: IWorkerDeliveryStore;
  queue:      IQueueEngine;
  email:      IEmailClient;
  logger:     IWorkerLogger;
  config:     WorkerConfig;
}
