export function firstCount(result: { total: number }[]): number {
  return result[0]?.total ?? 0;
}
