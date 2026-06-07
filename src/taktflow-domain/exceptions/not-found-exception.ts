import { DomainException } from './domain-exception.js';

export class NotFoundException extends DomainException {
  readonly code = 'NOT_FOUND';
  readonly statusCode = 404;

  constructor(resource: string, id?: string) {
    super(id ? `${resource} with id ${id} not found` : `${resource} not found`);
  }
}
