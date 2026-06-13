import type { DrizzleDb } from '@persistence/database.js';

import type { IDeliveryService }  from './interfaces/delivery-service.interface.js';
import type { IRetryService }     from './interfaces/retry-service.interface.js';
import type { ISchedulerService } from './interfaces/scheduler-service.interface.js';
import type { ICleanupService }   from './interfaces/cleanup-service.interface.js';
import type { IMetricsService }   from './interfaces/metrics-service.interface.js';

import { buildWorkerServices } from './extensions/service-collection.extension.js';

export class Worker {
  constructor(
    private readonly delivery:  IDeliveryService,
    private readonly retry:     IRetryService,
    private readonly scheduler: ISchedulerService,
    private readonly cleanup:   ICleanupService,
    private readonly metrics:   IMetricsService,
  ) {}

  start(): void {
    this.delivery.start();
    this.retry.start();
    this.scheduler.start();
    this.cleanup.start();
  }

  async stop(): Promise<void> {
    this.delivery.stop();
    this.retry.stop();
    this.scheduler.stop();
    this.cleanup.stop();
    await this.delivery.waitForDrain();
    await this.metrics.flush();
  }
}

export class WorkerFactory {
  constructor(private readonly db: DrizzleDb) {}

  create(): Worker {
    const { deliveryService, retryService, schedulerService, cleanupService, metricsService } =
      buildWorkerServices(this.db);

    return new Worker(deliveryService, retryService, schedulerService, cleanupService, metricsService);
  }
}
