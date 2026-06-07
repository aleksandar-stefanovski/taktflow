import { DomainException } from './domain-exception.js';

export class ValidationException extends DomainException {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 400;
  readonly errors: unknown;

  constructor(message: string, errors?: unknown) {
    super(message);
    this.errors = errors;
  }
}
