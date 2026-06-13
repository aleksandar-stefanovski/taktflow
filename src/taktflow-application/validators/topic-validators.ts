import { z } from 'zod';

export const CreateTopicSchema = z.object({
  name: z
    .string({ required_error: 'Topic name is required' })
    .min(1, 'Topic name cannot be empty')
    .max(255, 'Topic name cannot exceed 255 characters')
    .regex(/^[a-z0-9._-]+$/, 'Only lowercase letters, numbers, dots, hyphens, and underscores'),
  config: z.object({
    retentionDays: z.number().int().positive().optional(),
    ordering:      z.enum(['fifo', 'unordered']).optional(),
  }).optional(),
});

export const UpdateTopicSchema = z.object({
  name: z
    .string()
    .min(1, 'Topic name cannot be empty')
    .max(255, 'Topic name cannot exceed 255 characters')
    .regex(/^[a-z0-9._-]+$/, 'Only lowercase letters, numbers, dots, hyphens, and underscores')
    .optional(),
  config: z.object({
    retentionDays: z.number().int().positive().optional(),
    ordering:      z.enum(['fifo', 'unordered']).optional(),
  }).optional(),
});
