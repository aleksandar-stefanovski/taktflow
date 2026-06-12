import type { Event } from '@domain/entities/event.js';

export interface IWorkerEventStore {
  findById(id: string): Promise<Event | null>;
  create(event: Event): Promise<Event>;
}
