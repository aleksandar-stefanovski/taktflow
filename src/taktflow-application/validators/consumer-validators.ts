import { z } from 'zod';

import { PaginationSchema } from '@application/requests/pagination.request.js';

export const CreatePushConsumerSchema = z.object({
  topicId:     z.string().uuid(),
  name:        z.string().min(1).max(255),
  url:         z.string().url().refine((u) => u.startsWith('https://'), 'Consumer URL must use HTTPS'),
  environment: z.enum(['development', 'staging', 'production']),
});

export const CreatePullConsumerSchema = z.object({
  topicId:     z.string().uuid(),
  name:        z.string().min(1).max(255),
  environment: z.enum(['development', 'staging', 'production']),
});

export const UpdateConsumerSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  url:  z.string().url().refine((u) => u.startsWith('https://'), 'Consumer URL must use HTTPS').optional(),
});

export const ListConsumersSchema = PaginationSchema.extend({
  topicId: z.string().uuid().optional(),
});
