export interface QueuedEvent {
  id:          string;
  eventId:     string;
  tenantId:    string;
  topicId:     string;
  consumerId:  string;
  payload:     Record<string, unknown>;
  attempt:     number;
  scheduledAt: Date;
}
