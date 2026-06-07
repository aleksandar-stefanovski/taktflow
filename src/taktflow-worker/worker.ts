import 'dotenv/config';

import { connectDatabase } from '@persistence/database.js';
import { RETRY_DELAYS_SECONDS } from '@types/retry-constants.js';
import { MAX_RESPONSE_BODY_SIZE_BYTES } from '@types/worker-constants.js';
import { env } from './config/env.js';
import { buildWorkerEngine } from './extensions/worker-extensions.extension.js';

async function bootstrap(): Promise<void> {
  const db = await connectDatabase(env.DATABASE_URL);

  const engine = buildWorkerEngine(db, {
    batchSize:                env.WORKER_BATCH_SIZE,
    pollIntervalMs:           env.WORKER_POLL_INTERVAL_MS,
    deliveryTimeoutMs:        env.WORKER_DELIVERY_TIMEOUT_MS,
    stuckThresholdSeconds:    env.WORKER_STUCK_THRESHOLD_SECONDS,
    unstuckIntervalMs:        env.WORKER_UNSTUCK_INTERVAL_MS,
    retryIntervalMs:          env.WORKER_RETRY_INTERVAL_MS,
    schedulerIntervalMs:      env.WORKER_SCHEDULER_INTERVAL_MS,
    alertIntervalMs:          env.WORKER_ALERT_INTERVAL_MS,
    cleanupIntervalMs:        env.WORKER_CLEANUP_INTERVAL_MS,
    metricsFlushIntervalMs:   env.WORKER_METRICS_FLUSH_INTERVAL_MS,
    shutdownPollIntervalMs:   env.WORKER_SHUTDOWN_POLL_INTERVAL_MS,
    retryDelaysSeconds:       RETRY_DELAYS_SECONDS,
    maxResponseBodyBytes:     MAX_RESPONSE_BODY_SIZE_BYTES,
    defaultRetryAttempts:     3,
    schedulerBatchSize:       50,
    schedulerConsumerLimit:   100,
    awaitingAckTimeoutHours:  1,
    memoryWarningThresholdMb: 400,
    maxRetentionDays:         90,
    shutdownMaxWaitMs:        30_000,
  });

  engine.start();

  const shutdown = async (): Promise<void> => {
    await engine.stop();
    process.exit(0);
  };

  process.once('SIGTERM', shutdown);
  process.once('SIGINT',  shutdown);
}

bootstrap().catch((error: unknown) => {
  console.error('Failed to start worker', error);
  process.exit(1);
});
