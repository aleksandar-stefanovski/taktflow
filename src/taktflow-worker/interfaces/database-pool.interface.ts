import type { PoolQueryResult } from '../models/query-result.model.js';
import type { IPoolClient } from './pool-client.interface.js';

export interface IDatabasePool {
  query<T = Record<string, unknown>>(
    sql: string,
    values?: unknown[],
  ): Promise<PoolQueryResult<T>>;
  connect(): Promise<IPoolClient>;
}
