export class UsageResponse {
  readonly count:      number;
  readonly limit:      number;
  readonly percentage: number;

  constructor(data: { count: number; limit: number }) {
    this.count      = data.count;
    this.limit      = data.limit;
    this.percentage = data.limit > 0 ? Math.round((data.count / data.limit) * 100) : 0;
  }

  static mapFromEntity(data: { count: number; limit: number }): UsageResponse {
    return new UsageResponse(data);
  }
}
