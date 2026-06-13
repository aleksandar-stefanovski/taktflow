export interface IMetricsService {
  recordSuccess(tenantId: string, durationMs: number): void;
  recordFailure(tenantId: string): void;
  flush(): Promise<void>;
}
