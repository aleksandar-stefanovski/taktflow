export interface WorkerConfig {
  batchSize: number;
  pollIntervalMs: number;
  deliveryTimeoutMs: number;
  retryBaseDelayMs: number;
  maxResponseBodyBytes: number;
  defaultRetryAttempts: number;
  schedulerIntervalMs: number;
  schedulerBatchSize: number;
  schedulerConsumerLimit: number;
  retryIntervalMs: number;
  awaitingAckTimeoutHours: number;
  unstuckIntervalMs: number;
  stuckThresholdMs: number;
  alertIntervalMs: number;
  memoryWarningThresholdMb: number;
  metricsFlushIntervalMs: number;
  cleanupIntervalMs: number;
  maxRetentionDays: number;
  shutdownMaxWaitMs: number;
  shutdownPollIntervalMs: number;
}
