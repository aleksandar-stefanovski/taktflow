import { z } from 'zod';

import { paginatedResponseSchema } from './pagination-validators.js';

export const CreatePushConsumerSchema = z.object({
  topicId:     z.string().uuid(),
  name:        z.string().min(1).max(255),
  url:         z.string().url().refine((u) => u.startsWith('https://'), 'Consumer URL must use HTTPS'),
  environment: z.enum(['development', 'staging', 'production']),
  alertEmail:  z.string().email().nullable().optional(),
});

export const CreatePullConsumerSchema = z.object({
  topicId:     z.string().uuid(),
  name:        z.string().min(1).max(255),
  environment: z.enum(['development', 'staging', 'production']),
  alertEmail:  z.string().email().nullable().optional(),
});

const ConsumerConfigSchema = z.object({
  timeoutSeconds:     z.number().int(),
  retryAttempts:      z.number().int(),
  retryBackoff:       z.string(),
  retryInitialDelay:  z.number().int(),
  alertAfterFailures: z.number().int(),
  alertEmail:         z.string().nullable(),
  maxConcurrent:      z.number().int(),
});

export const CreatePushConsumerResponseSchema = z.object({
  id:          z.string().uuid(),
  topicId:     z.string().uuid(),
  name:        z.string(),
  type:        z.literal('push'),
  url:         z.string(),
  environment: z.string(),
  status:      z.string(),
  config:      ConsumerConfigSchema,
  createdAt:   z.string().datetime(),
});

export const CreatePullConsumerResponseSchema = z.object({
  id:          z.string().uuid(),
  topicId:     z.string().uuid(),
  name:        z.string(),
  type:        z.literal('pull'),
  environment: z.string(),
  status:      z.string(),
  config:      ConsumerConfigSchema,
  createdAt:   z.string().datetime(),
});

const ConsumerSummarySchema = z.object({
  id:          z.string().uuid(),
  topicId:     z.string().uuid(),
  name:        z.string(),
  type:        z.enum(['push', 'pull']),
  url:         z.string().nullable(),
  environment: z.string(),
  status:      z.string(),
  config:      ConsumerConfigSchema,
  createdAt:   z.string().datetime(),
  updatedAt:   z.string().datetime(),
});

export const UpdateConsumerSchema = z.object({
  name:       z.string().min(1).max(255).optional(),
  url:        z.string().url().refine((u) => u.startsWith('https://'), 'Consumer URL must use HTTPS').optional(),
  alertEmail: z.string().email().nullable().optional(),
});

export const ConsumerDetailResponseSchema = z.object({
  id:          z.string().uuid(),
  topicId:     z.string().uuid(),
  name:        z.string(),
  type:        z.enum(['push', 'pull']),
  url:         z.string().nullable(),
  environment: z.string(),
  status:      z.string(),
  config:      ConsumerConfigSchema,
  createdAt:   z.string().datetime(),
  updatedAt:   z.string().datetime(),
});

export const ListConsumersResponseSchema = paginatedResponseSchema(ConsumerSummarySchema);

export const ConsumerHealthResponseSchema = z.object({
  consumerId: z.string().uuid(),
  total:      z.number().int(),
  pending:    z.number().int(),
  processing: z.number().int(),
  delivered:  z.number().int(),
  failed:     z.number().int(),
  deadLetter: z.number().int(),
});
