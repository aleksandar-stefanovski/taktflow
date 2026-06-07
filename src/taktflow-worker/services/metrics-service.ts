import type { WorkerDependencies } from '../interfaces/worker-dependencies.interface.js';
import type { TenantAccumulator } from '../models/tenant-metrics.model.js';

export class MetricsService {
  private readonly counts = new Map<string, TenantAccumulator>();
  private lastFlush = Date.now();

  constructor(private readonly deps: WorkerDependencies) {}

  recordSuccess(tenantId: string, durationMs: number): void {
    const current = this.counts.get(tenantId) ?? { successCount: 0, totalDurationMs: 0 };
    this.counts.set(tenantId, {
      successCount:    current.successCount + 1,
      totalDurationMs: current.totalDurationMs + durationMs,
    });

    if (Date.now() - this.lastFlush >= this.deps.config.metricsFlushIntervalMs) {
      void this.flush().catch((error: unknown) => {
        this.deps.logger.logWorkerLoopError('metrics-flush', error as Error);
      });
    }
  }

  async flush(): Promise<void> {
    if (this.counts.size === 0) return;

    const snapshot = new Map(this.counts);
    this.counts.clear();
    this.lastFlush = Date.now();

    for (const [tenantId, { successCount, totalDurationMs }] of snapshot) {
      await this.deps.metrics.incrementSuccessBatch(tenantId, successCount, totalDurationMs);
    }
  }
}
