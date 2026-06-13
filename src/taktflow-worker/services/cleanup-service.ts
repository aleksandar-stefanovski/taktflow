import type { Pool } from 'pg';
import type { LoggerMessages } from '../extensions/logger-message.extension.js';
import type { WorkerConfig }   from '../config/worker.config.js';
import type { ICleanupService } from '../interfaces/cleanup-service.interface.js';
import { formatPartitionName, formatDate } from '../helpers/partition.helper.js';

export class CleanupService implements ICleanupService {
  private intervalHandle: NodeJS.Timeout | null = null;

  constructor(
    private readonly pool:   Pool,
    private readonly logger: LoggerMessages,
    private readonly config: WorkerConfig,
  ) {}

  start(): void {
    this.intervalHandle = setInterval(() => {
      void this.tick().catch((error: unknown) => {
        this.logger.logWorkerLoopError('cleanup', error as Error);
      });
    }, this.config.WORKER_CLEANUP_INTERVAL_MS);
  }

  stop(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }

  private async tick(): Promise<void> {
    await this.resetMonthlyCounters();
    await this.dropExpiredPartitions();
    await this.createNextMonthPartition();
    await this.purgeOldDeadLetterEvents();
    await this.purgeOldDeliveries();
  }

  private async resetMonthlyCounters(): Promise<void> {
    const now = new Date();
    if (now.getDate() !== 1) return;

    // NOTE: raw SQL required — Drizzle does not support DATE_TRUNC expressions in updates
    await this.pool.query(`
      UPDATE tenant_metrics
      SET events_today = 0
      WHERE DATE_TRUNC('month', updated_at) < DATE_TRUNC('month', NOW())
    `);
  }

  private async dropExpiredPartitions(): Promise<void> {
    // NOTE: raw SQL required — partition management is not supported by Drizzle
    const cutoffResult = await this.pool.query<{ cutoff: string }>(
      `SELECT TO_CHAR(NOW() - ($1 * INTERVAL '1 day'), 'YYYY_MM') AS cutoff`,
      [this.config.WORKER_MAX_RETENTION_DAYS],
    );

    const cutoff = cutoffResult.rows[0]?.cutoff;
    if (!cutoff) return;

    const partitionsResult = await this.pool.query<{ schema_name: string; table_name: string }>(
      `SELECT schemaname AS schema_name, tablename AS table_name
       FROM pg_tables
       WHERE tablename LIKE 'events_%'
       AND tablename < 'events_' || $1`,
      [cutoff],
    );

    for (const row of partitionsResult.rows) {
      if (!CleanupService.isValidPartitionName(row.table_name)) {
        this.logger.logWorkerLoopError(
          'cleanup',
          new Error(`Rejected invalid partition name: ${row.table_name}`),
        );
        continue;
      }

      const qualified = `${row.schema_name}.${row.table_name}`;
      await this.pool.query(`DROP TABLE IF EXISTS ${qualified}`);
      this.logger.logPartitionDropped(qualified);
    }
  }

  private static isValidPartitionName(name: string): boolean {
    return /^events_\d{4}_\d{2}$/.test(name);
  }

  private async purgeOldDeadLetterEvents(): Promise<void> {
    await this.pool.query(
      `DELETE FROM dead_letter_events
       WHERE created_at < NOW() - ($1 * INTERVAL '1 day')`,
      [this.config.WORKER_MAX_RETENTION_DAYS],
    );
  }

  private async purgeOldDeliveries(): Promise<void> {
    await this.pool.query(
      `DELETE FROM event_deliveries
       WHERE status IN ('delivered', 'failed')
       AND updated_at < NOW() - ($1 * INTERVAL '1 day')`,
      [this.config.WORKER_MAX_RETENTION_DAYS],
    );
  }

  private async createNextMonthPartition(): Promise<void> {
    // NOTE: raw SQL required — partition management is not supported by Drizzle
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);

    const afterNextMonth = new Date(nextMonth);
    afterNextMonth.setMonth(afterNextMonth.getMonth() + 1);

    const partitionName = formatPartitionName(nextMonth);
    const fromDate = formatDate(nextMonth);
    const toDate = formatDate(afterNextMonth);

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS ${partitionName}
      PARTITION OF events
      FOR VALUES FROM ('${fromDate}') TO ('${toDate}')
    `);
  }
}
