import type { PoolQueryResult } from '../models/query-result.model.js';

export interface IPoolClient {
  query<T = Record<string, unknown>>(
    sql: string,
    values?: unknown[],
  ): Promise<PoolQueryResult<T>>;
  release(): void;
}
