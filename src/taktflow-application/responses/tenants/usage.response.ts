import type { IUsageResult } from '../../interfaces/usage-result.interface.js';

export class UsageResponse {
  readonly count:      number;
  readonly limit:      number;
  readonly percentage: number;

  constructor(result: IUsageResult) {
    this.count      = result.count;
    this.limit      = result.limit;
    this.percentage = result.percentage;
  }

  static mapFromEntity(result: IUsageResult): UsageResponse {
    return new UsageResponse(result);
  }
}
