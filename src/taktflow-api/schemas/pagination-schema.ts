import { z } from 'zod';
import { serverConfig } from '@api/config/server.config.js';

export const PaginationSchema = z.object({
  page:     z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(serverConfig.MAX_PAGE_SIZE).default(serverConfig.DEFAULT_PAGE_SIZE),
});
