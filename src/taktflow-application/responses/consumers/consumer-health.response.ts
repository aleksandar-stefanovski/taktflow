import type { EventDelivery } from '@domain/entities/event-delivery.js';

export class ConsumerHealthResponse {
  readonly consumerId: string;
  readonly total:      number;
  readonly pending:    number;
  readonly processing: number;
  readonly delivered:  number;
  readonly failed:     number;
  readonly deadLetter: number;

  constructor(consumerId: string, deliveries: EventDelivery[]) {
    this.consumerId = consumerId;
    this.total      = deliveries.length;
    this.pending    = 0;
    this.processing = 0;
    this.delivered  = 0;
    this.failed     = 0;
    this.deadLetter = 0;

    for (const delivery of deliveries) {
      if (delivery.status === 'pending')     this.pending    += 1;
      if (delivery.status === 'processing')  this.processing += 1;
      if (delivery.status === 'delivered')   this.delivered  += 1;
      if (delivery.status === 'failed')      this.failed     += 1;
      if (delivery.status === 'dead_letter') this.deadLetter += 1;
    }
  }

  static mapFromEntity(consumerId: string, deliveries: EventDelivery[]): ConsumerHealthResponse {
    return new ConsumerHealthResponse(consumerId, deliveries);
  }
}
