export interface SqlResult<T> {
  rows: T[];
  rowCount: number | null;
}
