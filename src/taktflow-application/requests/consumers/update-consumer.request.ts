import type { z } from 'zod';

import type { UpdateConsumerSchema } from '@application/validators/consumer-validators.js';

export type UpdateConsumerRequest = z.infer<typeof UpdateConsumerSchema>;
