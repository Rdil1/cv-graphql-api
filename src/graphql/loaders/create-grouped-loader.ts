import DataLoader from 'dataloader';

export function createGroupedLoader<K, V>(
  batchFetch: (keys: readonly K[]) => Promise<V[]>,
  keyOf: (row: V) => K,
): DataLoader<K, V[]> {
  return new DataLoader<K, V[]>(async (keys) => {
    const rows = await batchFetch(keys);
    const groups = new Map<K, V[]>();
    for (const row of rows) {
      const key = keyOf(row);
      const group = groups.get(key);
      if (group) group.push(row);
      else groups.set(key, [row]);
    }
    return keys.map((key) => groups.get(key) ?? []);
  });
}
