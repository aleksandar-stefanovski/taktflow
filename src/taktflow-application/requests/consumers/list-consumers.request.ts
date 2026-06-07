import type { PaginationQuery } from '../pagination.request.js';

export type ListConsumersQuery = PaginationQuery & { topicId?: string };
