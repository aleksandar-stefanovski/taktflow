import type { z } from 'zod';

import type { ListConsumersSchema } from '@application/validators/consumer-validators.js';

export type ListConsumersQuery = z.infer<typeof ListConsumersSchema>;
