import type { ProduceEventSchema } from '../../validators/event-validators.js';
import type { z } from 'zod';

export type ProduceEventRequest = z.infer<typeof ProduceEventSchema>;
