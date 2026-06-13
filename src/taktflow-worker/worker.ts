import type { IDeliveryService }  from './interfaces/delivery-service.interface.js';
import type { IRetryService }     from './interfaces/retry-service.interface.js';
import type { ISchedulerService } from './interfaces/scheduler-service.interface.js';
import type { ICleanupService }   from './interfaces/cleanup-service.interface.js';
import type { IMetricsService }   from './interfaces/metrics-service.interface.js';
import type { LoggerMessages }    from './extensions/logger-message.extension.js';

export class Worker {
  constructor(
    private readonly delivery:  IDeliveryService,
    private readonly retry:     IRetryService,
    private readonly scheduler: ISchedulerService,
    private readonly cleanup:   ICleanupService,
    private readonly metrics:   IMetricsService,
    private readonly logger:    LoggerMessages,
  ) {}

  start(): void {
    this.metrics.start();
    this.delivery.start();
    this.retry.start();
    this.scheduler.start();
    this.cleanup.start();
    this.logger.logWorkerStarted();
  }

  async stop(): Promise<void> {
    this.logger.logWorkerStopping();

    await Promise.all([
      this.delivery.stop(),
      this.scheduler.stop(),
      this.retry.stop(),
      this.cleanup.stop(),
    ]);

    await this.metrics.stop();

    this.logger.logWorkerStopped();
  }
}
