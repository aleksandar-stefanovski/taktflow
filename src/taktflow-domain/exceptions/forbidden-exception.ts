import { DomainException } from './domain-exception.js';

export class ForbiddenException extends DomainException {
  readonly code = 'FORBIDDEN';
  readonly statusCode = 403;

  constructor(resource?: string) {
    super(resource ? `Access denied to ${resource}` : 'Access denied');
  }
}
