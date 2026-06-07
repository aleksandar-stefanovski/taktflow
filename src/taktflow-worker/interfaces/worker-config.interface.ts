export interface WorkerConfig {
  batchSize: number;
  pollIntervalMs: number;
  deliveryTimeoutMs: number;
  retryDelaysSeconds: readonly number[];
  maxResponseBodyBytes: number;
  defaultRetryAttempts: number;
  schedulerIntervalMs: number;
  schedulerBatchSize: number;
  schedulerConsumerLimit: number;
  retryIntervalMs: number;
  awaitingAckTimeoutHours: number;
  unstuckIntervalMs: number;
  stuckThresholdSeconds: number;
  alertIntervalMs: number;
  memoryWarningThresholdMb: number;
  metricsFlushIntervalMs: number;
  cleanupIntervalMs: number;
  maxRetentionDays: number;
  shutdownMaxWaitMs: number;
  shutdownPollIntervalMs: number;
}
