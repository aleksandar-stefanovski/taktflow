import { EntityKey } from './entity-key.js';

export abstract class EntityBase {
  readonly key:       EntityKey;
  readonly createdAt: Date;
  updatedAt:          Date;

  get id(): string {
    return this.key.id;
  }

  constructor(key: EntityKey, createdAt?: Date, updatedAt?: Date) {
    this.key       = key;
    this.createdAt = createdAt ?? new Date();
    this.updatedAt = updatedAt ?? new Date();
  }

  touch(): void {
    this.updatedAt = new Date();
  }
}
