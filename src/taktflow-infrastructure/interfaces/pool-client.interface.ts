import type { SqlResult } from './sql-result.interface.js';

export interface IPoolClient {
  query<T = Record<string, unknown>>(sql: string, values?: unknown[]): Promise<SqlResult<T>>;
  release(): void;
}
