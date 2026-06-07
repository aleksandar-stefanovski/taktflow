import { z } from 'zod';

const EmailSchema = z.object({
  RESEND_API_KEY:   z.string().min(1),
  ALERT_FROM_EMAIL: z.string().email(),
});

export const emailConfig = EmailSchema.parse(process.env);
