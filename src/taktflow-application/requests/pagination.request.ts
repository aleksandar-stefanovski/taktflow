import type { PaginationSchema } from '../validators/pagination-validators.js';
import type { z } from 'zod';

export type PaginationQuery = z.infer<typeof PaginationSchema>;
