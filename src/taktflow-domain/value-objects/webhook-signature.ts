import { createHmac, timingSafeEqual } from 'node:crypto';

export class WebhookSignature {
  private constructor(readonly value: string) {}

  static create(payload: string, secret: string, timestamp: string): WebhookSignature {
    const signature = createHmac('sha256', secret)
      .update(`${timestamp}.${payload}`)
      .digest('hex');
    return new WebhookSignature(signature);
  }

  // NOTE: timing-safe comparison prevents timing attacks — do not use ===
  equals(other: string): boolean {
    return timingSafeEqual(Buffer.from(this.value), Buffer.from(other));
  }
}
