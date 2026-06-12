import type { FailureAlertRow } from '@domain/interfaces/readonly/failure-alert-row.interface.js';

export interface IWorkerDeadLetterStore {
  findOverFailureThreshold(): Promise<FailureAlertRow[]>;
}
