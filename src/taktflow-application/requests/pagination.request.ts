import { z } from 'zod';

export const PaginationSchema = z.object({
  page:     z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(500).default(25),
});

export type PaginationQuery = z.infer<typeof PaginationSchema>;
