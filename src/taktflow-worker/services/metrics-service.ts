import type { ITenantMetricsRepository } from '@taktflow/domain/interfaces/tenant-metrics-repository.interface.js';
import type { LoggerMessages }           from '../extensions/logger-message.extension.js';
import type { WorkerConfig }             from '../config/worker.config.js';
import type { TenantAccumulator }        from '../models/tenant-metrics.model.js';
import type { IMetricsService }          from '../interfaces/metrics-service.interface.js';
import { RecurringTask }                 from '../helpers/recurring-task.helper.js';

export class MetricsService implements IMetricsService {
  private readonly successCounts = new Map<string, TenantAccumulator>();
  private readonly failureCounts = new Map<string, number>();
  private readonly task: RecurringTask;

  constructor(
    private readonly metricsRepository: ITenantMetricsRepository,
    private readonly logger:            LoggerMessages,
    private readonly config:            WorkerConfig,
  ) {
    this.task = new RecurringTask(
      this.config.WORKER_METRICS_FLUSH_INTERVAL_MS,
      () => this.flush(),
      error => this.logger.logWorkerLoopError('metrics-flush', error),
    );
  }

  start(): void {
    this.task.start();
  }

  async stop(): Promise<void> {
    await this.task.stop();
    await this.flush();
  }

  recordSuccess(tenantId: string, durationMs: number): void {
    const current = this.successCounts.get(tenantId) ?? { successCount: 0, totalDurationMs: 0 };
    this.successCounts.set(tenantId, {
      successCount:    current.successCount + 1,
      totalDurationMs: current.totalDurationMs + durationMs,
    });
  }

  recordFailure(tenantId: string): void {
    this.failureCounts.set(tenantId, (this.failureCounts.get(tenantId) ?? 0) + 1);
  }

  private async flush(): Promise<void> {
    if (this.successCounts.size === 0 && this.failureCounts.size === 0) return;

    const successSnapshot = new Map(this.successCounts);
    const failureSnapshot = new Map(this.failureCounts);
    this.successCounts.clear();
    this.failureCounts.clear();

    for (const [tenantId, { successCount, totalDurationMs }] of successSnapshot) {
      await this.metricsRepository.incrementSuccessBatch(tenantId, successCount, totalDurationMs);
    }

    for (const [tenantId, failureCount] of failureSnapshot) {
      await this.metricsRepository.incrementFailureBatch(tenantId, failureCount);
    }
  }
}
