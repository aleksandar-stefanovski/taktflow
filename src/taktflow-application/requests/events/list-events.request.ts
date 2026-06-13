import type { z } from 'zod';

import type { ListEventsSchema } from '@application/validators/event-validators.js';

export type ListEventsQuery = z.infer<typeof ListEventsSchema>;
