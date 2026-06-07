import type { CreateTopicSchema } from '../../validators/topic-validators.js';
import type { z } from 'zod';

export type CreateTopicRequest = z.infer<typeof CreateTopicSchema>;
