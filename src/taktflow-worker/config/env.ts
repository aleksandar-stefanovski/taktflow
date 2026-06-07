import { z } from 'zod';

const EnvSchema = z.object({
  DATABASE_URL:                     z.string().url(),
  RESEND_API_KEY:                   z.string().min(1),
  ALERT_FROM_EMAIL:                 z.string().email().default('alerts@taktflow.io'),
  LOG_LEVEL:                        z.enum(['trace', 'debug', 'info', 'warn', 'error']).default('info'),
  WORKER_BATCH_SIZE:                z.coerce.number().default(50),
  WORKER_POLL_INTERVAL_MS:          z.coerce.number().default(100),
  WORKER_DELIVERY_TIMEOUT_MS:       z.coerce.number().default(30_000),
  WORKER_STUCK_THRESHOLD_SECONDS:   z.coerce.number().default(60),
  WORKER_UNSTUCK_INTERVAL_MS:       z.coerce.number().default(30_000),
  WORKER_RETRY_INTERVAL_MS:         z.coerce.number().default(5_000),
  WORKER_SCHEDULER_INTERVAL_MS:     z.coerce.number().default(10_000),
  WORKER_ALERT_INTERVAL_MS:         z.coerce.number().default(60_000),
  WORKER_CLEANUP_INTERVAL_MS:       z.coerce.number().default(86_400_000),
  WORKER_METRICS_FLUSH_INTERVAL_MS: z.coerce.number().default(60_000),
  WORKER_SHUTDOWN_POLL_INTERVAL_MS: z.coerce.number().default(100),
});

export const env = EnvSchema.parse(process.env);
export type WorkerEnv = z.infer<typeof EnvSchema>;
