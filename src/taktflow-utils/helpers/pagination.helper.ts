export function toPage(page: number, pageSize: number): { limit: number; offset: number } {
  return {
    limit:  pageSize,
    offset: (page - 1) * pageSize,
  };
}
