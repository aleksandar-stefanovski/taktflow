export type TopicConfig = {
  retentionDays: number;
  maxPayloadKb:  number;
  ordering:      'fifo' | 'unordered';
};
