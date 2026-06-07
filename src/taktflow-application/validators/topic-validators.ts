import { z } from 'zod';

import { paginatedResponseSchema } from './pagination-validators.js';

export const CreateTopicSchema = z.object({
  name: z
    .string({ required_error: 'Topic name is required' })
    .min(1, 'Topic name cannot be empty')
    .max(255, 'Topic name cannot exceed 255 characters')
    .regex(/^[a-z0-9._-]+$/, 'Only lowercase letters, numbers, dots, hyphens, and underscores'),
  config: z.object({
    retentionDays: z.number().int().min(1).max(365).default(7),
    maxPayloadKb:  z.number().int().min(1).max(1024).default(256),
    ordering:      z.enum(['fifo', 'unordered']).default('unordered'),
  }).optional(),
});

const TopicConfigSchema = z.object({
  retentionDays: z.number().int(),
  maxPayloadKb:  z.number().int(),
  ordering:      z.string(),
});

const TopicSummarySchema = z.object({
  id:        z.string().uuid(),
  name:      z.string(),
  config:    TopicConfigSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateTopicResponseSchema = z.object({
  id:        z.string().uuid(),
  name:      z.string(),
  config:    TopicConfigSchema,
  createdAt: z.string().datetime(),
});

export const UpdateTopicSchema = z.object({
  name: z
    .string()
    .min(1, 'Topic name cannot be empty')
    .max(255, 'Topic name cannot exceed 255 characters')
    .regex(/^[a-z0-9._-]+$/, 'Only lowercase letters, numbers, dots, hyphens, and underscores')
    .optional(),
  config: z.object({
    retentionDays: z.number().int().min(1).max(365).optional(),
    maxPayloadKb:  z.number().int().min(1).max(1024).optional(),
    ordering:      z.enum(['fifo', 'unordered']).optional(),
  }).optional(),
});

export const TopicDetailResponseSchema = z.object({
  id:        z.string().uuid(),
  name:      z.string(),
  config:    TopicConfigSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const ListTopicsResponseSchema = paginatedResponseSchema(TopicSummarySchema);
