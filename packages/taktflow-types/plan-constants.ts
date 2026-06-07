export const PLAN_LIMITS = {
  starter: {
    eventsPerMonth:  100_000,
    ingestBatchSize: 1_000,
    pullBatchSize:   100,
    retentionDays:   7,
  },
  growth: {
    eventsPerMonth:  1_000_000,
    ingestBatchSize: 10_000,
    pullBatchSize:   500,
    retentionDays:   30,
  },
  business: {
    eventsPerMonth:  10_000_000,
    ingestBatchSize: 50_000,
    pullBatchSize:   1_000,
    retentionDays:   90,
  },
  enterprise: {
    eventsPerMonth:  100_000_000,
    ingestBatchSize: 500_000,
    pullBatchSize:   10_000,
    retentionDays:   365,
  },
} as const;

export type PlanTier = keyof typeof PLAN_LIMITS;
