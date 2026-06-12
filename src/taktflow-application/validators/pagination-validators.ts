import { z } from 'zod';

export const PaginationSchema = z.object({
  page:     z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export function paginatedResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    items:       z.array(itemSchema),
    totalCount:  z.number().int(),
    totalPages:  z.number().int(),
    currentPage: z.number().int(),
    pageSize:    z.number().int(),
  });
}
