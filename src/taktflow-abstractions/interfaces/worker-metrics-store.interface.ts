export interface IWorkerMetricsStore {
  incrementSuccessBatch(tenantId: string, successCount: number, totalProcessingMs: number): Promise<void>;
}
