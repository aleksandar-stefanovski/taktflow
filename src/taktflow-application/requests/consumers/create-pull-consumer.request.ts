import type { z } from 'zod';

import type { CreatePullConsumerSchema } from '@application/validators/consumer-validators.js';

export type CreatePullConsumerRequest = z.infer<typeof CreatePullConsumerSchema>;
