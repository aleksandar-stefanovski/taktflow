import { Resend } from 'resend';

import type { IEmailClient } from '../interfaces/email-client.interface.js';
import type { FailureAlertParams } from '../interfaces/failure-alert-params.interface.js';
import type { ApproachingLimitParams } from '../interfaces/approaching-limit-params.interface.js';

export class ResendEmailClient implements IEmailClient {
  private readonly client: Resend;

  constructor(
    apiKey: string,
    private readonly fromEmail: string,
  ) {
    this.client = new Resend(apiKey);
  }

  async sendFailureAlert(params: FailureAlertParams): Promise<void> {
    const { consumerId, failureCount, alertEmail } = params;

    await this.client.emails.send({
      from:    this.fromEmail,
      to:      alertEmail,
      subject: `Consumer alert: ${failureCount} delivery failures in the last 24 hours`,
      html: `
        <p>Your consumer <strong>${consumerId}</strong> has recorded
        <strong>${failureCount} delivery failures</strong> in the last 24 hours.</p>
        <p>Check your dead-letter queue for details and replay or dismiss failed events.</p>
      `.trim(),
    });
  }

  async sendApproachingLimitWarning(params: ApproachingLimitParams): Promise<void> {
    const { alertEmail, currentCount, limit } = params;
    const percentUsed = Math.round((currentCount / limit) * 100);

    await this.client.emails.send({
      from:    this.fromEmail,
      to:      alertEmail,
      subject: `Usage warning: ${percentUsed}% of your monthly event limit used`,
      html: `
        <p>Your account has used <strong>${currentCount.toLocaleString()}</strong> of
        <strong>${limit.toLocaleString()}</strong> events (${percentUsed}%) for this calendar month.</p>
        <p>Upgrade your plan before reaching the limit to avoid ingestion being paused.</p>
      `.trim(),
    });
  }
}
