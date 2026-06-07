import type { DeadLetterEvent } from '../entities/dead-letter-event.js';
import type { ITenantRepository } from './tenant-repository.interface.js';

export interface FailureAlertRow {
  consumerId: string;
  tenantId: string;
  failureCount: number;
  alertEmail: string;
}

export interface IDeadLetterEventRepository extends ITenantRepository<DeadLetterEvent> {
  findUnreplayed(tenantId: string): Promise<DeadLetterEvent[]>;
  findOverFailureThreshold(): Promise<FailureAlertRow[]>;
}
