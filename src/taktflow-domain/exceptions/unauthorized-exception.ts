import { DomainException } from './domain-exception.js';

export class UnauthorizedException extends DomainException {
  readonly code = 'UNAUTHORIZED';
  readonly statusCode = 401;

  constructor(message = 'Unauthorized') {
    super(message);
  }
}
