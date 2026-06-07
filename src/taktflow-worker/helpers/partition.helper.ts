export function formatPartitionName(date: Date): string {
  const year  = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `events_${year}_${month}`;
}

export function formatDate(date: Date): string {
  const year  = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
}
