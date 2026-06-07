import { z } from 'zod';

const MAX_PAGE_SIZE     = 500;
const DEFAULT_PAGE_SIZE = 100;

export const PaginationSchema = z.object({
  page:     z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
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
