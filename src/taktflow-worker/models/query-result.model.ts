export type PoolQueryResult<T = Record<string, unknown>> = {
  rows: T[];
  rowCount: number | null;
};
