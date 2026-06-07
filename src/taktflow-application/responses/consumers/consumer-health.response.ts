import type { IConsumerHealth } from '../../interfaces/consumer-health.interface.js';

export class ConsumerHealthResponse {
  readonly consumerId: string;
  readonly total:      number;
  readonly pending:    number;
  readonly processing: number;
  readonly delivered:  number;
  readonly failed:     number;
  readonly deadLetter: number;

  constructor(health: IConsumerHealth) {
    this.consumerId = health.consumerId;
    this.total      = health.total;
    this.pending    = health.pending;
    this.processing = health.processing;
    this.delivered  = health.delivered;
    this.failed     = health.failed;
    this.deadLetter = health.deadLetter;
  }

  static mapFromEntity(health: IConsumerHealth): ConsumerHealthResponse {
    return new ConsumerHealthResponse(health);
  }
}
