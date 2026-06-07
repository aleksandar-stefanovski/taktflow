export interface TopicConfig {
  retentionDays: number;
  maxPayloadKb:  number;
  ordering:      'fifo' | 'unordered';
}
