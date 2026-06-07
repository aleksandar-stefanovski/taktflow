import type { WorkerConfig } from '../interfaces/worker-config.interface.js';
import type { IWorkerLogger } from '../interfaces/worker-logger.interface.js';
import type { RetryService } from '../services/retry-service.js';

export class UnstuckLoop {
  private intervalHandle: NodeJS.Timeout | null = null;

  constructor(
    private readonly config: WorkerConfig,
    private readonly logger: IWorkerLogger,
    private readonly service: RetryService,
  ) {}

  start(): void {
    this.intervalHandle = setInterval(() => {
      void this.service.releaseStuckDeliveries().catch((error: unknown) => {
        this.logger.logWorkerLoopError('unstuck', error as Error);
      });
    }, this.config.unstuckIntervalMs);
  }

  stop(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }
}
