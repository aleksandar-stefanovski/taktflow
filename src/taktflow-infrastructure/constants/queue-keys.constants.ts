export const QUEUE_KEYS = {
  STREAM:          'taktflow:events',
  RETRY:           'taktflow:retry-queue',
  DLQ:             'taktflow:dlq',
  GROUP:           'taktflow-workers',
  DELIVERY_PREFIX: 'taktflow:delivery:',
} as const;
