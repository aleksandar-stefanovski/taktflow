import type { WorkerConfig } from '../interfaces/worker-config.interface.js';
import type { IWorkerLogger } from '../interfaces/worker-logger.interface.js';
import type { AlertService } from '../services/alert-service.js';

export class AlertLoop {
  private intervalHandle: NodeJS.Timeout | null = null;

  constructor(
    private readonly config: WorkerConfig,
    private readonly logger: IWorkerLogger,
    private readonly service: AlertService,
  ) {}

  start(): void {
    this.intervalHandle = setInterval(() => {
      void this.service.runTick().catch((error: unknown) => {
        this.logger.logWorkerLoopError('alert', error as Error);
      });
    }, this.config.alertIntervalMs);
  }

  stop(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }
}
