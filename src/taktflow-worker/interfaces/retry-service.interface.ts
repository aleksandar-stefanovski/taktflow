import type { ClaimedEvent } from '@taktflow/domain/types/claimed-event.type.js';

export interface IRetryService {
  start(): void;
  stop(): Promise<void>;
  scheduleRetryOrDeadLetter(
    delivery: ClaimedEvent,
    reason: string,
    responseStatus?: number,
    responseBody?: string,
  ): Promise<void>;
}
