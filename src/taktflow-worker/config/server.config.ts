import { z } from 'zod';

const ServerSchema = z.object({
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error']),
});

export const serverConfig = ServerSchema.parse(process.env);
