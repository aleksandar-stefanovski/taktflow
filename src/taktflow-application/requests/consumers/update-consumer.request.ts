import type { z } from 'zod';

import type { UpdateConsumerSchema } from '../../validators/consumer-validators.js';

export type UpdateConsumerRequest = z.infer<typeof UpdateConsumerSchema>;
