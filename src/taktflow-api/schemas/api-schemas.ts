import { zodToJsonSchema as _zodToJsonSchema } from 'zod-to-json-schema';
import type { ZodTypeAny } from 'zod';

export function zodToJsonSchema(schema: ZodTypeAny): object {
  return _zodToJsonSchema(schema, { $refStrategy: 'none', target: 'openApi3' });
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
