import type { FailureAlertParams } from './failure-alert-params.interface.js';
import type { ApproachingLimitParams } from './approaching-limit-params.interface.js';

export interface IEmailClient {
  sendFailureAlert(params: FailureAlertParams): Promise<void>;
  sendApproachingLimitWarning(params: ApproachingLimitParams): Promise<void>;
}
