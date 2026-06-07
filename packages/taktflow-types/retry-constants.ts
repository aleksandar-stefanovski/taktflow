export const RETRY_DELAYS_SECONDS = [30, 120, 300, 1800, 3600] as const;

export function getRetryDelay(attempt: number): number {
  return RETRY_DELAYS_SECONDS[attempt] ?? RETRY_DELAYS_SECONDS[RETRY_DELAYS_SECONDS.length - 1] ?? 3600;
}
