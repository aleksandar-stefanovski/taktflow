import type { z } from 'zod';

import type { AcknowledgeEventSchema } from '@application/validators/event-validators.js';

export type AcknowledgeEventRequest = z.infer<typeof AcknowledgeEventSchema>;
