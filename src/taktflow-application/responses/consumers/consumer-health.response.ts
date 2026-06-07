import type { ConsumerHealth } from '../../handlers/get-consumer-health-handler.js';

export class ConsumerHealthResponse {
  readonly consumerId: string;
  readonly total:      number;
  readonly pending:    number;
  readonly processing: number;
  readonly delivered:  number;
  readonly failed:     number;
  readonly deadLetter: number;

  constructor(health: ConsumerHealth) {
    this.consumerId = health.consumerId;
    this.total      = health.total;
    this.pending    = health.pending;
    this.processing = health.processing;
    this.delivered  = health.delivered;
    this.failed     = health.failed;
    this.deadLetter = health.deadLetter;
  }
}
