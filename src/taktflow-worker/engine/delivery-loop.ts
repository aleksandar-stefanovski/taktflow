import type { WorkerConfig } from '../interfaces/worker-config.interface.js';
import type { IWorkerLogger } from '../interfaces/worker-logger.interface.js';
import type { DeliveryService } from '../services/delivery-service.js';

export class DeliveryLoop {
  private intervalHandle: NodeJS.Timeout | null = null;

  constructor(
    private readonly config: WorkerConfig,
    private readonly logger: IWorkerLogger,
    private readonly service: DeliveryService,
  ) {}

  start(): void {
    this.intervalHandle = setInterval(() => {
      void this.service.claimAndDeliver().catch((error: unknown) => {
        this.logger.logWorkerLoopError('delivery', error as Error);
      });
    }, this.config.pollIntervalMs);
  }

  stop(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }

  getActiveDeliveries(): number {
    return this.service.getActiveDeliveries();
  }
}
