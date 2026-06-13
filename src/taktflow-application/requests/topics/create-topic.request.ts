import type { CreateTopicSchema } from '@application/validators/topic-validators.js';
import type { z } from 'zod';

export type CreateTopicRequest = z.infer<typeof CreateTopicSchema>;
