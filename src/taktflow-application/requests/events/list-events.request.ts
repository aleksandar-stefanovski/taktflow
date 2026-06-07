import type { ListEventsSchema } from '../../validators/event-validators.js';
import type { z } from 'zod';

export type ListEventsQuery = z.infer<typeof ListEventsSchema>;
