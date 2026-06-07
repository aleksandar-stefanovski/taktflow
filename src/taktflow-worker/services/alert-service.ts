import type { WorkerDependencies } from '../interfaces/worker-dependencies.interface.js';

export class AlertService {
  constructor(private readonly deps: WorkerDependencies) {}

  async runTick(): Promise<void> {
    this.checkMemoryPressure();
    await this.checkFailureThresholds();
  }

  private checkMemoryPressure(): void {
    const { heapUsed } = process.memoryUsage();
    const usedMb = Math.round(heapUsed / 1024 / 1024);
    if (usedMb > this.deps.config.memoryWarningThresholdMb) {
      this.deps.logger.logHighMemoryUsage(usedMb);
    }
  }

  private async checkFailureThresholds(): Promise<void> {
    const rows = await this.deps.dlq.findOverFailureThreshold();
    for (const row of rows) {
      await this.deps.email.sendFailureAlert({
        tenantId:     row.tenantId,
        consumerId:   row.consumerId,
        failureCount: row.failureCount,
        alertEmail:   row.alertEmail,
      });
      this.deps.logger.logAlertSent(row.tenantId, row.consumerId);
    }
  }
}
