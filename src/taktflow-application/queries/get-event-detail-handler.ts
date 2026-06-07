import type { IEventRepository } from '@domain/interfaces/event-repository.interface.js';
import type { Event } from '@domain/entities/event.js';
import { NotFoundException } from '@domain/exceptions/not-found-exception.js';

export class GetEventDetailHandler {
  constructor(private readonly events: IEventRepository) {}

  async handle(eventId: string, tenantId: string): Promise<Event> {
    const event = await this.events.findById(eventId, tenantId);
    if (!event) throw new NotFoundException('Event', eventId);
    return event;
  }
}
