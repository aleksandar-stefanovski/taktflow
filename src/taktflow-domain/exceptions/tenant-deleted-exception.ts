import { DomainException } from './domain-exception.js';

export class TenantDeletedException extends DomainException {
  readonly code = 'TENANT_DELETED';
  readonly statusCode = 410;

  constructor(message = 'This tenant has been deleted. Reactivate within the grace period.') {
    super(message);
  }
}
