import { DomainException } from './domain-exception.js';

export class ConflictException extends DomainException {
  readonly code = 'CONFLICT';
  readonly statusCode = 409;
}
