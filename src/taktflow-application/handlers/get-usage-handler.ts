import type { IUsageService } from '../interfaces/usage-service.interface.js';

export interface UsageResult {
  count: number;
  limit: number;
  percentage: number;
}

export class GetUsageHandler {
  constructor(private readonly usage: IUsageService) {}

  async handle(tenantId: string): Promise<UsageResult> {
    const [count, limit] = await Promise.all([
      this.usage.getMonthlyCount(tenantId),
      this.usage.getPlanLimit(tenantId),
    ]);

    const percentage = limit > 0 ? Math.round((count / limit) * 100) : 0;

    return { count, limit, percentage };
  }
}
