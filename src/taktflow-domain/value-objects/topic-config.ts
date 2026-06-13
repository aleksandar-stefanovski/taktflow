export type TopicConfig = {
  retentionDays: number;
  ordering:      'fifo' | 'unordered';
};
