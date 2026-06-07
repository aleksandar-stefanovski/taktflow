export interface ConsumerConfig {
  timeoutMs:          number;
  retryAttempts:      number;
  retryBackoff:       'exponential' | 'fixed' | 'linear';
  retryInitialDelayMs: number;
  alertAfterFailures: number;
  alertEmail:         string | null;
  maxConcurrent:      number;
}
