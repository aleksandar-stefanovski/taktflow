import type { TopicConfig } from '../interfaces/topic-config.interface.js';

export const DEFAULT_TOPIC_CONFIG: TopicConfig = {
  retentionDays: 7,
  maxPayloadKb:  256,
  ordering:      'unordered',
};
