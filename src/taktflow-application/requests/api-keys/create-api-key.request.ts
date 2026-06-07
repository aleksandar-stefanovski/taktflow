import type { CreateApiKeySchema } from '../../validators/api-key-validators.js';
import type { z } from 'zod';

export type CreateApiKeyRequest = z.infer<typeof CreateApiKeySchema>;
