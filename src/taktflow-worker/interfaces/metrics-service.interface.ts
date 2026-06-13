export interface IMetricsService {
  start(): void;
  stop(): Promise<void>;
  recordSuccess(tenantId: string, durationMs: number): void;
  recordFailure(tenantId: string): void;
}
