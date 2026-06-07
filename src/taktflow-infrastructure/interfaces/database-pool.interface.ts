import type { SqlResult } from './sql-result.interface.js';
import type { IPoolClient } from './pool-client.interface.js';

export interface IDatabasePool {
  query<T = Record<string, unknown>>(sql: string, values?: unknown[]): Promise<SqlResult<T>>;
  connect(): Promise<IPoolClient>;
}
