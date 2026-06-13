export type TopicConfig = {
  retentionDays: number;
  maxPayloadBytes: number;
  ordering:      'fifo' | 'unordered';
};
