export class PaginatedResult<T> {
  readonly items:       T[];
  readonly totalCount:  number;
  readonly totalPages:  number;
  readonly currentPage: number;
  readonly pageSize:    number;

  constructor(items: T[], totalCount: number, page: number, pageSize: number) {
    this.items       = items;
    this.totalCount  = totalCount;
    this.totalPages  = totalCount === 0 ? 0 : Math.ceil(totalCount / pageSize);
    this.currentPage = page;
    this.pageSize    = pageSize;
  }
}
