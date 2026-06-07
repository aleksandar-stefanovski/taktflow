import { z } from 'zod';

import { paginatedResponseSchema } from './pagination-validators.js';

export const CreateApiKeySchema = z.object({
  name:        z.string().min(1).max(255),
  environment: z.enum(['development', 'staging', 'production']),
});

export const CreateApiKeyResponseSchema = z.object({
  id:          z.string().uuid(),
  name:        z.string(),
  keyPrefix:   z.string(),
  environment: z.string(),
  rawKey:      z.string(),
  createdAt:   z.string().datetime(),
});

const ApiKeySchema = z.object({
  id:          z.string().uuid(),
  name:        z.string(),
  keyPrefix:   z.string(),
  environment: z.string(),
  lastUsed:    z.string().datetime().nullable(),
  createdAt:   z.string().datetime(),
  updatedAt:   z.string().datetime(),
});

export const GetApiKeyResponseSchema = ApiKeySchema;

export const ListApiKeysResponseSchema = paginatedResponseSchema(ApiKeySchema);
