import type { PaginationSchema } from '../../validators/pagination-validators.js';
import type { z } from 'zod';

export type ListDeadLetterEventsQuery = z.infer<typeof PaginationSchema> & { tenantId: string };
