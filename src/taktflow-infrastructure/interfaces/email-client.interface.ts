export interface FailureAlertParams {
  tenantId:     string;
  consumerId:   string;
  failureCount: number;
  alertEmail:   string;
}

export interface ApproachingLimitParams {
  tenantId:     string;
  alertEmail:   string;
  currentCount: number;
  limit:        number;
}

export interface IEmailClient {
  sendFailureAlert(params: FailureAlertParams): Promise<void>;
  sendApproachingLimitWarning(params: ApproachingLimitParams): Promise<void>;
}
