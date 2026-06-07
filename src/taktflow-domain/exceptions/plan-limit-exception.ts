import { DomainException } from './domain-exception.js';

export class PlanLimitException extends DomainException {
  readonly code = 'PLAN_LIMIT_EXCEEDED';
  readonly statusCode = 429;

  constructor(resource: string, limit: number) {
    super(`${resource} limit of ${limit} exceeded. Please upgrade your plan.`);
  }
}
