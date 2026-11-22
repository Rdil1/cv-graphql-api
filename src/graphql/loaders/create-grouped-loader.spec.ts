import { createGroupedLoader } from './create-grouped-loader';

describe('createGroupedLoader', () => {
  it('batches keys into a single fetch and groups rows by key', async () => {
    const fetch = jest.fn(async (keys: readonly string[]) =>
      [
        { owner: 'a', value: 1 },
        { owner: 'b', value: 2 },
        { owner: 'a', value: 3 },
      ].filter((row) => keys.includes(row.owner)),
    );
    const loader = createGroupedLoader(fetch, (row) => row.owner);

    const [a, b, c] = await Promise.all([loader.load('a'), loader.load('b'), loader.load('c')]);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(a.map((r) => r.value)).toEqual([1, 3]);
    expect(b.map((r) => r.value)).toEqual([2]);
    expect(c).toEqual([]);
  });
});
