import type { ClaimedEvent } from '@domain/types/claimed-event.type.js';

export interface IRetryService {
  start(): void;
  stop(): void;
  scheduleRetryOrDeadLetter(
    delivery: ClaimedEvent,
    reason: string,
    responseStatus?: number,
    responseBody?: string,
  ): Promise<void>;
}
