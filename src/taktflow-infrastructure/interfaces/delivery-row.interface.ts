export interface DeliveryRow {
  id: string;
  event_id: string;
  tenant_id: string;
  topic_id: string;
  consumer_id: string;
  payload: Record<string, unknown>;
  retry_count: number;
  scheduled_at: Date;
}
