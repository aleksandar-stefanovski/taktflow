export interface IUsageService {
  getMonthlyCount(tenantId: string): Promise<number>;
  getPlanLimit(tenantId: string): Promise<number>;
  getPayloadLimit(tenantId: string): Promise<number>;
  assertWithinLimit(tenantId: string, incoming: number): Promise<void>;
}
