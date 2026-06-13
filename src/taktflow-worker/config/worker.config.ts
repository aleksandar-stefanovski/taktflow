import { z } from 'zod';

const WorkerSchema = z.object({
  LOG_LEVEL:                            z.enum(['trace', 'debug', 'info', 'warn', 'error']),
  WORKER_BATCH_SIZE:                    z.coerce.number().int().positive(),
  WORKER_POLL_INTERVAL_MS:              z.coerce.number().int().positive(),
  WORKER_DELIVERY_TIMEOUT_MS:           z.coerce.number().int().positive(),
  WORKER_STUCK_THRESHOLD_MS:            z.coerce.number().int().positive(),
  WORKER_UNSTUCK_INTERVAL_MS:           z.coerce.number().int().positive(),
  WORKER_RETRY_INTERVAL_MS:             z.coerce.number().int().positive(),
  WORKER_SCHEDULER_INTERVAL_MS:         z.coerce.number().int().positive(),
  WORKER_CLEANUP_INTERVAL_MS:           z.coerce.number().int().positive(),
  WORKER_METRICS_FLUSH_INTERVAL_MS:     z.coerce.number().int().positive(),
  WORKER_SHUTDOWN_POLL_INTERVAL_MS:     z.coerce.number().int().positive(),
  WORKER_SHUTDOWN_MAX_WAIT_MS:          z.coerce.number().int().positive(),
  WORKER_DEFAULT_RETRY_ATTEMPTS:        z.coerce.number().int().positive(),
  WORKER_SCHEDULER_BATCH_SIZE:          z.coerce.number().int().positive(),
  WORKER_SCHEDULER_CONSUMER_LIMIT:      z.coerce.number().int().positive(),
  WORKER_AWAITING_ACK_TIMEOUT_HOURS:    z.coerce.number().int().positive(),
  WORKER_MEMORY_WARNING_THRESHOLD_MB:   z.coerce.number().int().positive(),
  WORKER_MAX_RETENTION_DAYS:            z.coerce.number().int().positive(),
  WORKER_MAX_RESPONSE_BODY_BYTES:       z.coerce.number().int().positive(),
  RETRY_BASE_DELAY_MS:                  z.coerce.number().int().positive(),
});

export type WorkerConfig = z.infer<typeof WorkerSchema>;
export const workerConfig = WorkerSchema.parse(process.env);
