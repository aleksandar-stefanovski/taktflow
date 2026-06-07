import type { WorkerDependencies } from '../interfaces/worker-dependencies.interface.js';
import { sleep } from '../helpers/sleep.helper.js';

import { DeliveryService }  from '../services/delivery-service.js';
import { RetryService }     from '../services/retry-service.js';
import { AlertService }     from '../services/alert-service.js';
import { MetricsService }   from '../services/metrics-service.js';
import { SchedulerService } from '../services/scheduler-service.js';

import { DeliveryLoop }  from './delivery-loop.js';
import { SchedulerLoop } from './scheduler-loop.js';
import { RetryLoop }     from './retry-loop.js';
import { UnstuckLoop }   from './unstuck-loop.js';
import { AlertLoop }     from './alert-loop.js';
import { CleanupLoop }   from './cleanup-loop.js';

export class WorkerEngine {
  private readonly deliveryLoop: DeliveryLoop;
  private readonly schedulerLoop: SchedulerLoop;
  private readonly retryLoop: RetryLoop;
  private readonly unstuckLoop: UnstuckLoop;
  private readonly alertLoop: AlertLoop;
  private readonly cleanupLoop: CleanupLoop;

  constructor(private readonly deps: WorkerDependencies) {
    const retryService     = new RetryService(deps);
    const metricsService   = new MetricsService(deps);
    const alertService     = new AlertService(deps);
    const deliveryService  = new DeliveryService(deps, retryService, metricsService);
    const schedulerService = new SchedulerService(deps);

    this.deliveryLoop  = new DeliveryLoop(deps.config, deps.logger, deliveryService);
    this.schedulerLoop = new SchedulerLoop(deps.config, deps.logger, schedulerService);
    this.retryLoop     = new RetryLoop(deps.config, deps.logger, retryService);
    this.unstuckLoop   = new UnstuckLoop(deps.config, deps.logger, retryService);
    this.alertLoop     = new AlertLoop(deps.config, deps.logger, alertService);
    this.cleanupLoop   = new CleanupLoop(deps);
  }

  start(): void {
    this.deliveryLoop.start();
    this.schedulerLoop.start();
    this.retryLoop.start();
    this.unstuckLoop.start();
    this.alertLoop.start();
    this.cleanupLoop.start();
    this.deps.logger.logWorkerStarted();
  }

  async stop(): Promise<void> {
    this.deliveryLoop.stop();
    this.schedulerLoop.stop();
    this.retryLoop.stop();
    this.unstuckLoop.stop();
    this.alertLoop.stop();
    this.cleanupLoop.stop();

    let elapsed = 0;

    while (
      this.deliveryLoop.getActiveDeliveries() > 0 &&
      elapsed < this.deps.config.shutdownMaxWaitMs
    ) {
      await sleep(this.deps.config.shutdownPollIntervalMs);
      elapsed += this.deps.config.shutdownPollIntervalMs;
    }
  }
}
