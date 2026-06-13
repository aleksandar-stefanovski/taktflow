import { zodToJsonSchema as _zodToJsonSchema } from 'zod-to-json-schema';
import type { ZodTypeAny } from 'zod';
import { z } from 'zod';

export function zodToJsonSchema(schema: ZodTypeAny): object {
  return _zodToJsonSchema(schema, { $refStrategy: 'none', target: 'openApi3' });
}

export function paginatedResponseSchema<T extends ZodTypeAny>(itemSchema: T) {
  return z.object({
    items:       z.array(itemSchema),
    totalCount:  z.number().int(),
    totalPages:  z.number().int(),
    currentPage: z.number().int(),
    pageSize:    z.number().int(),
  });
}

export const ErrorResponseSchema = {
  type:     'object',
  properties: {
    success: { type: 'boolean', enum: [false] },
    error: {
      type: 'object',
      properties: {
        code:    { type: 'string' },
        message: { type: 'string' },
      },
    },
  },
} as const;
