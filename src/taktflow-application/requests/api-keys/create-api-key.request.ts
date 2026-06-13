import type { CreateApiKeySchema } from '@application/validators/api-key-validators.js';
import type { z } from 'zod';

export type CreateApiKeyRequest = z.infer<typeof CreateApiKeySchema>;
