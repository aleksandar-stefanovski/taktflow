import type { PaginationOptions } from '@domain/interfaces/pagination-options.interface.js';
import type { PagedData } from '@domain/interfaces/paged-data.interface.js';

export class PaginatedResult<T> {
  readonly items:       T[];
  readonly totalCount:  number;
  readonly totalPages:  number;
  readonly currentPage: number;
  readonly pageSize:    number;

  constructor(data: PagedData<T>, options: PaginationOptions) {
    this.items       = data.items;
    this.totalCount  = data.totalCount;
    this.totalPages  = data.totalCount === 0 ? 0 : Math.ceil(data.totalCount / options.pageSize);
    this.currentPage = options.page;
    this.pageSize    = options.pageSize;
  }
}
