import type { ConsumerConfig } from '../interfaces/consumer-config.interface.js';

export const DEFAULT_CONSUMER_CONFIG: ConsumerConfig = {
  timeoutSeconds:     30,
  retryAttempts:      3,
  retryBackoff:       'exponential',
  retryInitialDelay:  30,
  alertAfterFailures: 3,
  alertEmail:         null,
  maxConcurrent:      10,
};
