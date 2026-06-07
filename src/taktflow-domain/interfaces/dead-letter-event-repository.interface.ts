import type { DeadLetterEvent } from '../entities/dead-letter-event.js';
import type { FailureAlertRow } from './failure-alert-row.interface.js';
import type { ITenantRepository } from './tenant-repository.interface.js';

export interface IDeadLetterEventRepository extends ITenantRepository<DeadLetterEvent> {
  findUnreplayed(tenantId: string): Promise<DeadLetterEvent[]>;
  findOverFailureThreshold(): Promise<FailureAlertRow[]>;
}
