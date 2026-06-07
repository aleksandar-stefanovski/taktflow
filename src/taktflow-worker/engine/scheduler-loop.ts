import type { WorkerConfig } from '../interfaces/worker-config.interface.js';
import type { IWorkerLogger } from '../interfaces/worker-logger.interface.js';
import type { SchedulerService } from '../services/scheduler-service.js';

export class SchedulerLoop {
  private intervalHandle: NodeJS.Timeout | null = null;

  constructor(
    private readonly config: WorkerConfig,
    private readonly logger: IWorkerLogger,
    private readonly service: SchedulerService,
  ) {}

  start(): void {
    this.intervalHandle = setInterval(() => {
      void this.service.processDueSchedules(new Date()).catch((error: unknown) => {
        this.logger.logWorkerLoopError('scheduler', error as Error);
      });
    }, this.config.schedulerIntervalMs);
  }

  stop(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }
}
