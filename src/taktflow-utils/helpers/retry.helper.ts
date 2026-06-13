export function calcRetryDelay(attempt: number, baseDelayMs: number): number {
  return baseDelayMs * Math.pow(2, attempt);
}
