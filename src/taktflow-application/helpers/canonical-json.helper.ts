function sortKeys(value: unknown): unknown {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(sortKeys);
  return Object.fromEntries(
    Object.keys(value as Record<string, unknown>)
      .sort()
      .map(key => [key, sortKeys((value as Record<string, unknown>)[key])]),
  );
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}
