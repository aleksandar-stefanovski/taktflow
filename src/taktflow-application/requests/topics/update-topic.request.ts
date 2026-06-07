import type { z } from 'zod';

import type { UpdateTopicSchema } from '../../validators/topic-validators.js';

export type UpdateTopicRequest = z.infer<typeof UpdateTopicSchema>;
