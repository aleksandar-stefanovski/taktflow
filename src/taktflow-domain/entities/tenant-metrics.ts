export class TenantMetrics {
  readonly tenantId: string;
  eventsToday: number;
  eventsTotal: number;
  successCount: number;
  failureCount: number;
  totalProcessingMs: number;
  updatedAt: Date;

  constructor(props: {
    tenantId: string;
    eventsToday?: number;
    eventsTotal?: number;
    successCount?: number;
    failureCount?: number;
    totalProcessingMs?: number;
    updatedAt?: Date;
  }) {
    this.tenantId = props.tenantId;
    this.eventsToday = props.eventsToday ?? 0;
    this.eventsTotal = props.eventsTotal ?? 0;
    this.successCount = props.successCount ?? 0;
    this.failureCount = props.failureCount ?? 0;
    this.totalProcessingMs = props.totalProcessingMs ?? 0;
    this.updatedAt = props.updatedAt ?? new Date();
  }
}
