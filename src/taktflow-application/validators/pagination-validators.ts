import { z } from 'zod';

export function paginatedResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    items:       z.array(itemSchema),
    totalCount:  z.number().int(),
    totalPages:  z.number().int(),
    currentPage: z.number().int(),
    pageSize:    z.number().int(),
  });
}
