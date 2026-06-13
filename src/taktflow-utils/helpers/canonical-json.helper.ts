type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function sortKeys(value: JsonValue): JsonValue {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(sortKeys);
  return Object.fromEntries(
    Object.keys(value).sort().map(key => [key, sortKeys(value[key] ?? null)]),
  );
}

export function canonicalJson(value: Record<string, unknown>): string {
  return JSON.stringify(sortKeys(value as JsonValue));
}
