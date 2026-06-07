import type { UsageResult } from '../../handlers/get-usage-handler.js';

export class UsageResponse {
  readonly count:      number;
  readonly limit:      number;
  readonly percentage: number;

  constructor(result: UsageResult) {
    this.count      = result.count;
    this.limit      = result.limit;
    this.percentage = result.percentage;
  }
}
