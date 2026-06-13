import { z } from 'zod';

export const CreateApiKeySchema = z.object({
  name:        z.string().min(1).max(255),
  environment: z.enum(['development', 'staging', 'production']),
});
