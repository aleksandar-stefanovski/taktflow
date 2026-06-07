export interface ConsumerConfig {
  timeoutSeconds:     number;
  retryAttempts:      number;
  retryBackoff:       'exponential' | 'fixed' | 'linear';
  retryInitialDelay:  number;
  alertAfterFailures: number;
  alertEmail:         string | null;
  maxConcurrent:      number;
}
