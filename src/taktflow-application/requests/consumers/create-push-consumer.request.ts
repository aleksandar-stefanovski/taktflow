import type { z } from 'zod';

import type { CreatePushConsumerSchema } from '@application/validators/consumer-validators.js';

export type CreatePushConsumerRequest = z.infer<typeof CreatePushConsumerSchema>;
