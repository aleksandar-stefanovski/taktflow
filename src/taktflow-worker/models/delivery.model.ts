export type ClaimedDelivery = {
  id: string;
  event_id: string;
  tenant_id: string;
  consumer_id: string;
  retry_count: number;
  scheduled_at: Date;
  started_at: Date | null;
};
