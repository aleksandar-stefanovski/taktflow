import { randomUUID } from 'node:crypto';

export abstract class BaseEntity {
  readonly id: string;
  readonly createdAt: Date;
  updatedAt: Date;

  constructor(id?: string, createdAt?: Date, updatedAt?: Date) {
    this.id = id ?? randomUUID();
    this.createdAt = createdAt ?? new Date();
    this.updatedAt = updatedAt ?? new Date();
  }

  touch(): void {
    this.updatedAt = new Date();
  }
}
