import type { z } from 'zod';

import type { ListDeadLetterEventsSchema } from '@application/validators/dead-letter-validators.js';

export type ListDeadLetterEventsQuery = z.infer<typeof ListDeadLetterEventsSchema>;
